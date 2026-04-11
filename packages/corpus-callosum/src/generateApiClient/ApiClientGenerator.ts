import { mkdirSync, writeFileSync } from "node:fs";
import path from "path";
import type { Schema } from "../utils/Schema";
import type { Config, PartialConfig } from "../Config/Config";
import { Writer } from "../Writer/Writer";
import { SchemaManager } from "../SchemaManager/SchemaManager";
import { ConfigManager } from "../ConfigManager/ConfigManager";

type DocEntry = { id: string; endpoint: string; method: string; model?: any };
type MapEntry = {
	key: string;
	modelKey: string;
	funcKey: string;
	params: string[];
	model?: any;
	method: string;
	endpoint: string;
};

export class ApiClientGenerator {
	constructor(
		private readonly pkgPath: string,
		private readonly docs: Record<string, DocEntry>,
		private readonly cliOverrides: Omit<PartialConfig, "jsonSchemaOptions">,
	) {}

	private readonly schemaManager = new SchemaManager(this.config);

	get config(): Config {
		return {
			...ConfigManager.getDefaultConfig(),
			...ConfigManager.getFileConfig(),
			...this.cliOverrides,
		};
	}

	public async generate() {
		const outputPath = this.config.output.split("/");
		const dirName = outputPath.slice(0, -1);
		const fileName = outputPath[outputPath.length - 1] ?? "generated.ts";
		const dir = path.resolve(process.cwd(), ...dirName);
		const file = path.join(dir, fileName);
		mkdirSync(dir, { recursive: true });
		writeFileSync(
			file,
			await this.generateFileContent(Object.values(this.docs)),
		);
	}

	private getRouteMap(routes: DocEntry[]) {
		const map = new Map<string, MapEntry>();

		for (const r of routes) {
			const key = this.toCamelCaseKey(r.endpoint, r.method);
			map.set(r.id, {
				key,
				params: this.extractParams(r.endpoint),
				modelKey: `${this.capitalize(key)}Model`,
				funcKey: `make${this.capitalize(key)}Request`,
				model: r.model,
				method: r.method,
				endpoint: r.endpoint,
			});
		}

		return map;
	}

	private async generateFileContent(routes: DocEntry[]) {
		const map = this.getRouteMap(routes);

		const w = new Writer();

		if (this.config.exportClientAs !== false) {
			w.$import({
				keys: ["C"],
				from: this.pkgPath,
			});
		}
		w.line("");
		w.$type({ name: "_Prim", value: "string | number | boolean" });

		w.line("");
		w.$type({
			name: "ExtractArgs",
			generics: ["T"],
			value: `(Omit<T, "response"> extends infer U ? { [K in keyof U as U[K] extends undefined ? never : K]: U[K] } : never) & { headers?: HeadersInit; init?: RequestInit }`,
		});

		w.line("");
		w.$interface({
			name: "ReqArgs",
			body: (w) => {
				w.pair("endpoint", "string");
				w.pair("method", "string");
				w.pair("body?", "unknown");
				w.pair("search?", "Record<string, unknown>");
				w.pair("headers?", "HeadersInit");
				w.pair("init?", "RequestInit");
			},
		});

		for (const r of map.values()) {
			await this.writeModel(w, r.modelKey, r.params, r.model);

			w.$arrow({
				name: r.funcKey,
				args: [`args: ExtractArgs<${r.modelKey}>`],
				body: (w) =>
					w.$return((w) => {
						if (r.params.length === 0) {
							w.pair("endpoint", `"${r.endpoint}"`);
						} else {
							w.pair(
								"endpoint",
								`\`${r.endpoint
									.split(/:([a-zA-Z_][a-zA-Z0-9_]*)/)
									.map((part, i) => {
										if (i % 2 === 1) return `\${String(args.params.${part})}`;
										return part.replace("*", `\${String(args.params["*"])}`);
									})
									.join("")}\``,
							);
						}

						w.pair("method", `"${r.method}"`);
						w.pair("search", `args.search`);
						if (r.model?.body) {
							w.pair("body", `args.body`);
						}
					}),
			});
		}

		if (this.config.exportClientAs !== false) {
			w.$class({
				name: this.config.exportClientAs,
				constr: {
					args: [
						{ keyword: "public readonly", key: "baseUrl", type: "string" },
					],
				},
				body: (w) => {
					w.$arrowMethod({
						keyword: "public",
						isAsync: true,
						name: "fetchFn",
						type: "<R = unknown>(args: ReqArgs) => Promise<R>",
						args: ["args"],
						body: (w) => {
							w.line(`const url = new URL(args.endpoint, this.baseUrl);`);
							w.line(`const headers = new Headers(args.headers);`);
							w.line(`const method: RequestInit["method"] = args.method;`);
							w.line(`let body: RequestInit["body"];`);

							w.$if(`args.search`).then((w) => {
								w.$for(
									[`const`, `[key, val]`, `of`, `Object.entries(args.search)`],
									(w) => {
										w.$if(`val == null`).then((w) => w.line(`continue;`));
										w.line(`url.searchParams.append(key, String(val));`);
									},
								);
							});

							w.$if(`args.body`).then((w) => {
								w.$if(
									`!headers.has("Content-Type")`,
									`||`,
									`!headers.has("content-type")`,
								).then((w) => {
									w.line(`headers.set("Content-Type", "application/json");`);
								});
								w.line(`body = JSON.stringify(args.body);`);
							});

							w.line(
								`const res = await fetch(url, { method, headers, body, ...args.init });`,
							);
							w.line(`return await C.Parser.parseBody(res);`);
						},
					});

					w.$method({
						keyword: "public",
						isAsync: false,
						name: "setFetchFn",
						args: ["cb: <R = unknown>(args: ReqArgs) => Promise<R>"],
						body: (w) => w.$return("this.fetchFn = cb"),
					});

					w.$member({
						keyword: "public readonly",
						name: "endpoints",
						value: (w) => {
							w.line("{");
							for (const r of map.values()) {
								w.pair(
									r.key,
									r.params.length === 0
										? `"${r.endpoint}"`
										: `(p: ExtractArgs<${r.modelKey}>["params"]) => \`${r.endpoint
												.split(/:([a-zA-Z_][a-zA-Z0-9_]*)/)
												.map((part, i) => {
													if (i % 2 === 1) return `\${String(p.${part})}`;
													return part.replace("*", `\${String(p["*"])}`);
												})
												.join("")}\``,
								);
							}
							w.line("};");
						},
					});

					for (const r of map.values()) {
						w.$arrowMethod({
							keyword: "public",
							name: r.key,
							args: [`args: ExtractArgs<${r.modelKey}>`],
							body: (w) =>
								w.$return(
									`this.fetchFn<${r.modelKey}["response"]>(${r.funcKey}(args))`,
								),
						});
					}
				},
			});
		}

		const consts = Array.from(w.variables);
		const types = Array.from(w.interfaces);

		w.$export({ variant: "type", keys: types });
		w.line("");

		if (this.config.exportRoutesAs === "individual") {
			w.$export({ variant: "obj", keys: consts });
		} else if (this.config.exportRoutesAs === "default") {
			w.$export({ variant: "default", keys: consts });
		} else {
			w.$export({
				variant: "named",
				name: this.config.exportRoutesAs,
				keys: consts,
			});
		}

		return w.read();
	}

	private extractParams(path: string): string[] {
		const named =
			path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)?.map((p) => p.substring(1)) ||
			[];
		if (path.includes("*")) named.push("*");
		return named;
	}

	private capitalize(s: string): string {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	private toCamelCaseKey(path: string, method: string): string {
		const parts = path.split("/").filter((part) => part.length > 0);
		const processedParts = parts.map((part, index) => {
			let cleanPart = part.startsWith(":") ? part.substring(1) : part;

			// First handle hyphens: convert to camelCase
			cleanPart = cleanPart.replace(/-([a-zA-Z0-9])/g, (_, char) => {
				return char.toUpperCase();
			});

			// Then replace any other non-alphanumeric chars (except underscore) with underscore
			cleanPart = cleanPart.replace(/[^a-zA-Z0-9_]/g, "_");

			if (index === 0) return cleanPart;
			return cleanPart.charAt(0).toUpperCase() + cleanPart.slice(1);
		});
		let result = processedParts.join("");
		if (/^\d/.test(result)) result = "_" + result;

		return (
			result + method.slice(0, 1).toUpperCase() + method.slice(1).toLowerCase()
		);
	}

	// TODO: just write
	private async writeModel(
		w: Writer,
		modelKey: string,
		params: string[],
		routeModel: any,
	) {
		const model: Record<
			"body" | "search" | "params" | "response",
			{ opt: boolean; type: string }
		> = {
			body: { opt: false, type: `` },
			search: { opt: true, type: `Record<string, unknown>` },
			params: { opt: false, type: `` },
			response: { opt: false, type: `unknown` },
		};

		if (routeModel?.body) {
			model.body = {
				opt: false,
				type: await this.buildSchemaType(routeModel.body),
			};
		}

		if (routeModel?.search) {
			model.search = {
				opt: false,
				type: await this.buildSchemaType(routeModel.search),
			};
		}

		if (routeModel?.params) {
			model.params = {
				opt: false,
				type: await this.buildSchemaType(routeModel.params),
			};
		} else if (params.length > 0) {
			model.params = {
				opt: false,
				type: `{ ${params.map((p) => `${p === "*" ? '"*"' : p}: _Prim`).join(";")}}`,
			};
		}

		if (routeModel?.response) {
			model.response = {
				opt: false,
				type: await this.buildSchemaType(routeModel.response),
			};
		}

		w.$interface({
			name: modelKey,
			body: (w) => {
				for (const [key, val] of Object.entries(model)) {
					if (val.type === "") continue;
					w.pair(`${val.opt ? `${key}?` : key}`, `${val.type}`);
				}
			},
		});
	}

	private async buildSchemaType(schema: Schema): Promise<string> {
		try {
			return await this.schemaManager.toInterface(
				this.schemaManager.toJsonSchema(schema, this.config.validationLibrary),
			);
		} catch (err) {
			console.log(JSON.stringify(schema));
			throw err;
		}
	}
}
