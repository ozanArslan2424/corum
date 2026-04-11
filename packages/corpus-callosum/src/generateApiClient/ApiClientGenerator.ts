import { mkdirSync } from "node:fs";
import path from "path";
import type { Schema } from "../utils/Schema";
import type { Config, PartialConfig } from "../Config/Config";
import { Writer } from "../Writer/Writer";
import { SchemaManager } from "../SchemaManager/SchemaManager";
import { ConfigManager } from "../ConfigManager/ConfigManager";

type DocEntry = { id: string; endpoint: string; method: string; model?: any };
type MapEntry = {
	camelKey: string;
	pascalKey: string;
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

		const routes = Object.values(this.docs);
		const w = new Writer(file);
		const map = this.getRouteMap(routes);

		this.writeInitialContent(w);
		await this.writeModelsNamespace(w, map);

		for (const r of map.values()) {
			// await this.writeModel(w, r);
			this.writeRequestMaker(w, r);
		}
		this.writeArgsNamespace(w, map);
		this.writeApiClientClass(w, map);
		this.writeExports(w);
	}

	private getRouteMap(routes: DocEntry[]) {
		const map = new Map<string, MapEntry>();

		for (const r of routes) {
			const camelKey = this.toCamelCaseKey(r.endpoint, r.method);
			const pascalKey = this.capitalize(camelKey);
			map.set(r.id, {
				camelKey,
				pascalKey,
				params: this.extractParams(r.endpoint),
				modelKey: `Models.${pascalKey}`,
				funcKey: `make${pascalKey}Request`,
				model: r.model,
				method: r.method,
				endpoint: r.endpoint,
			});
		}

		return map;
	}

	private writeInitialContent(w: Writer) {
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
	}

	// private async writeModel(w: Writer, r: MapEntry) {
	// 	const model: Record<
	// 		"body" | "search" | "params" | "response",
	// 		{ opt: boolean; type: string }
	// 	> = {
	// 		body: { opt: false, type: `` },
	// 		search: { opt: true, type: `Record<string, unknown>` },
	// 		params: { opt: false, type: `` },
	// 		response: { opt: false, type: `unknown` },
	// 	};
	//
	// 	if (r.model?.body) {
	// 		model.body = {
	// 			opt: false,
	// 			type: await this.buildSchemaType(r.model.body),
	// 		};
	// 	}
	//
	// 	if (r.model?.search) {
	// 		model.search = {
	// 			opt: false,
	// 			type: await this.buildSchemaType(r.model.search),
	// 		};
	// 	}
	//
	// 	if (r.model?.params) {
	// 		model.params = {
	// 			opt: false,
	// 			type: await this.buildSchemaType(r.model.params),
	// 		};
	// 	} else if (r.params.length > 0) {
	// 		model.params = {
	// 			opt: false,
	// 			type: `{ ${r.params.map((p) => `${p === "*" ? '"*"' : p}: _Prim`).join(";")}}`,
	// 		};
	// 	}
	//
	// 	if (r.model?.response) {
	// 		model.response = {
	// 			opt: false,
	// 			type: await this.buildSchemaType(r.model.response),
	// 		};
	// 	}
	//
	// 	w.$interface({
	// 		name: r.modelKey,
	// 		body: (w) => {
	// 			for (const [key, val] of Object.entries(model)) {
	// 				if (val.type === "") continue;
	// 				w.pair(`${val.opt ? `${key}?` : key}`, `${val.type}`);
	// 			}
	// 		},
	// 	});
	// }

	private writeRequestMaker(w: Writer, r: MapEntry) {
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

	private async writeModelsNamespace(w: Writer, map: Map<string, MapEntry>) {
		const models = new Map<
			string,
			Record<
				"body" | "search" | "params" | "response",
				{ opt: boolean; type: string }
			>
		>();

		for (const r of map.values()) {
			const model: Record<
				"body" | "search" | "params" | "response",
				{ opt: boolean; type: string }
			> = {
				body: { opt: false, type: `` },
				search: { opt: true, type: `Record<string, unknown>` },
				params: { opt: false, type: `` },
				response: { opt: false, type: `unknown` },
			};

			if (r.model?.body) {
				model.body = {
					opt: false,
					type: await this.buildSchemaType(r.model.body),
				};
			}

			if (r.model?.search) {
				model.search = {
					opt: false,
					type: await this.buildSchemaType(r.model.search),
				};
			}

			if (r.model?.params) {
				model.params = {
					opt: false,
					type: await this.buildSchemaType(r.model.params),
				};
			} else if (r.params.length > 0) {
				model.params = {
					opt: false,
					type: `{ ${r.params.map((p) => `${p === "*" ? '"*"' : p}: _Prim`).join(";")}}`,
				};
			}

			if (r.model?.response) {
				model.response = {
					opt: false,
					type: await this.buildSchemaType(r.model.response),
				};
			}

			models.set(r.pascalKey, model);
		}

		w.$namespace({
			name: "Models",
			body: (w) => {
				for (const [pascalKey, model] of models.entries()) {
					w.$interface({
						isExported: true,
						name: pascalKey,
						body: (w) => {
							for (const [key, val] of Object.entries(model)) {
								if (val.type === "") continue;
								w.pair(`${val.opt ? `${key}?` : key}`, `${val.type}`);
							}
						},
					});
				}
			},
		});
	}

	private writeArgsNamespace(w: Writer, map: Map<string, MapEntry>) {
		w.$namespace({
			name: "Args",
			body: (w) => {
				for (const r of map.values()) {
					w.$type({
						name: r.pascalKey,
						value: `ExtractArgs<${r.modelKey}>`,
						isExported: true,
					});
				}
			},
		});
	}

	private writeApiClientClass(w: Writer, map: Map<string, MapEntry>) {
		if (this.config.exportClientAs === false) return;

		w.$class({
			name: this.config.exportClientAs,
			constr: {
				args: [{ keyword: "public readonly", key: "baseUrl", type: "string" }],
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
						w.inline("{");
						for (const r of map.values()) {
							w.pair(
								r.camelKey,
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
						w.untab("}");
					},
				});
				w.line("");

				for (const r of map.values()) {
					w.$arrowMethod({
						keyword: "public",
						name: r.camelKey,
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

	private writeExports(w: Writer) {
		const consts = Array.from(w.variables);
		const types = Array.from(w.interfaces).filter(
			(t) => !["_Prim", "ExtractArgs", "ReqArgs"].includes(t),
		);

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

	private async buildSchemaType(schema: Schema): Promise<string> {
		try {
			return await this.schemaManager.toInterface(
				this.schemaManager.toJsonSchema(schema),
			);
		} catch (err) {
			console.error(
				`[corpus] Failed to convert schema to TypeScript interface. ` +
					`Check your config.jsonSchemaOptions in corpus.config.ts.\n` +
					`Schema: ${JSON.stringify(schema, null, 2)}`,
			);
			throw err;
		}
	}
}
