import fs from "node:fs";
import path from "path";

import type { EntityDefinition } from "@ozanarslan/corpus";

import type { Config, PartialConfig } from "../Config/Config";
import { ConfigManager } from "../ConfigManager/ConfigManager";
import { SchemaManager } from "../SchemaManager/SchemaManager";
import type { Schema } from "../utils/Schema";
import { toPascalCase } from "../utils/toPascalCase";
import { Writer } from "../Writer/Writer";

type DocEntry = { id: string; endpoint: string; method: string; model?: any };
type MapEntry = {
	camelKey: string;
	pascalKey: string;
	modelKey: string;
	argsKey: string;
	funcKey: string;
	params: string[];
	model?: any;
	method: string;
	endpoint: string;
};

export class ApiClientGenerator {
	constructor(
		private readonly registry: any,
		private readonly cliOverrides: Omit<PartialConfig, "jsonSchemaOptions">,
	) {
		this.docs = this.registry.docs;
		this.entities = this.registry.entities.map;
	}

	private readonly docs: Map<string, DocEntry>;
	private readonly entities: Map<string, EntityDefinition>;
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
		fs.mkdirSync(dir, { recursive: true });

		const routes = Array.from(this.docs.values());
		const w = new Writer(file);
		const map = this.getRouteMap(routes);

		this.writeInitialContent(w);
		await this.writeEntitiesNamespace(w, this.entities);
		await this.writeModelsNamespace(w, map);
		this.writeArgsNamespace(w, map);
		this.writeApiClientClass(w, map);
		this.writeExports(w);
		await w.format("typescript");
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
				argsKey: `Args.${pascalKey}`,
				funcKey: `make${pascalKey}Request`,
				model: r.model,
				method: r.method,
				endpoint: r.endpoint,
			});
		}

		return map;
	}

	private writeInitialContent(w: Writer) {
		w.$type({ name: "_Prim", value: "string | number | boolean" });
		w.line("");

		w.$type({
			name: "Prettify",
			generics: ["T"],
			value: "{ [K in keyof T]: T[K] } & {}",
		});
		w.line("");

		w.$type({
			name: "ExtractArgs",
			generics: ["T"],
			value: (w) => {
				w.inline(
					`(Omit<T, "response"> extends infer U ? { [K in keyof U as U[K] extends undefined ? never : K]: U[K] } : never) & {`,
				);
				w.pair("headers?", "HeadersInit");
				w.pair("init?", "RequestInit");
				w.untab("}");
			},
		});
		w.line("");

		w.$interface({
			name: "RequestDescriptor",
			body: (w) => {
				w.pair("endpoint", "string");
				w.pair("method", "string");
				w.pair("body?", "unknown");
				w.pair("search?", "Record<string, unknown>");
				w.pair("headers?", "HeadersInit");
				w.pair("init?", `Omit<RequestInit, "headers">`);
			},
		});
	}

	private async writeEntitiesNamespace(w: Writer, map: Map<string, EntityDefinition>) {
		const types = new Map<string, string>();
		for (const def of map.values()) {
			if (def.jsonSchema) {
				types.set(
					def.name,
					await this.buildJsonSchemaType(def.jsonSchema as Record<string, unknown>),
				);
			} else {
				types.set(def.name, await this.buildSchemaType(def.schema));
			}
		}

		w.$namespace({
			name: "Entities",
			body: (w) => {
				for (const [name, typedef] of types.entries()) {
					const pascalKey = toPascalCase(name);
					w.$type({ isExported: true, name: pascalKey, value: typedef });
					w.$const({
						isExported: true,
						name: pascalKey,
						value: `(class { constructor(values: ${pascalKey}) { Object.assign(this, values); } }) as unknown as new (values: ${pascalKey}) => ${pascalKey}`,
					});
				}
			},
		});
	}

	private async writeModelsNamespace(w: Writer, map: Map<string, MapEntry>) {
		const models = new Map<
			string,
			Record<"body" | "search" | "params" | "response", { opt: boolean; type: string }>
		>();

		for (const r of map.values()) {
			const model: Record<
				"body" | "search" | "params" | "response",
				{ opt: boolean; type: string }
			> = {
				body: { opt: false, type: "" },
				search: { opt: true, type: "Record<string, unknown>" },
				params: { opt: false, type: "" },
				response: { opt: false, type: "void" },
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
					w.$type({
						isExported: true,
						name: pascalKey,
						value: (w) => {
							w.inline("Prettify<{");

							for (const [key, val] of Object.entries(model)) {
								if (val.type === "" || key === "body") continue;
								w.line(`${val.opt ? `${key}?` : key}: ${val.type}`);
							}

							if (model.body.type !== "") {
								w.untab("} & ({");
								w.line(`body: ${model.body.type}`);
								w.line("formData?: never");
								w.untab("} | {");
								w.line("body?: never");
								w.line("formData: FormData");
								w.untab("})>");
							} else {
								w.untab("}>");
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
					type: "<R = unknown>(args: RequestDescriptor) => Promise<R>",
					args: ["args"],
					body: (w) => {
						w.line(`const url = new URL(args.endpoint, this.baseUrl);`);
						w.line(`const headers = new Headers(args.headers);`);
						w.line(`const method: RequestInit["method"] = args.method;`);
						w.line(`let body: RequestInit["body"];`);

						w.$if(`args.search`).then((w) => {
							w.$for([`const`, `[key, val]`, `of`, `Object.entries(args.search)`], (w) => {
								w.$if(`val == null`).then((w) => w.line(`continue;`));
								w.line(
									`url.searchParams.append(key, typeof val === "object" ? JSON.stringify(val as object) : String(val as _Prim));`,
								);
							});
						});

						w.$if(`args.body`).then((w) => {
							w.$if(`!headers.has("Content-Type")`, `||`, `!headers.has("content-type")`).then(
								(w) => {
									w.$if(`!(args.body instanceof FormData)`).then((w) => {
										w.line(`headers.set("Content-Type", "application/json");`);
									});
								},
							);
							w.line(
								`body = args.body instanceof FormData ? args.body : JSON.stringify(args.body);`,
							);
						});

						w.$const({
							name: "req",
							value: "new Request(url, { method, headers, body, ...args.init })",
						});
						w.$const({ name: "res", value: "await fetch(req)" });
						w.$const({
							name: "contentType",
							value: `res.headers.get("content-type")`,
						});

						w.line(`if (contentType?.includes("application/json")) return await res.json();`);
						w.line(`if (contentType?.includes("text/")) return await res.text();`);
						w.line(`return await res.blob();`);
					},
				});

				w.$method({
					keyword: "public",
					isAsync: false,
					name: "setFetchFn",
					args: ["cb: <R = unknown>(args: RequestDescriptor) => Promise<R>"],
					body: (w) => w.$return("this.fetchFn = cb"),
				});

				w.$member({
					keyword: "public readonly",
					name: "endpoints",
					value: w.scope((w) => {
						for (const r of map.values()) {
							w.pair(
								r.camelKey,
								r.params.length === 0
									? w.str(r.endpoint)
									: `(p: ${r.argsKey}["params"]) => \`${r.endpoint
											.split(/:([a-zA-Z_][a-zA-Z0-9_]*)/)
											.map((part, i) => {
												if (i % 2 === 1) return `\${String(p.${part})}`;
												return part.replace("*", `\${String(p["*"])}`);
											})
											.join("")}\``,
							);
						}
					}),
				});
				w.line("");

				for (const r of map.values()) {
					w.$arrowMethod({
						keyword: "public",
						name: r.camelKey,
						args: [`args: ${r.argsKey}`],
						body: (w) => {
							w.$const({
								name: "req",
								value: w.scope((w) => {
									if (r.params.length === 0) {
										w.pair("endpoint", w.str(r.endpoint));
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

									w.pair("method", w.str(r.method));
									w.pair("search", `args.search`);
									if (r.model?.body) {
										w.pair("body", `args.body ?? args.formData`);
									}
								}),
							});
							w.$return(`this.fetchFn<${r.modelKey}["response"]>(req)`);
						},
					});
				}
			},
		});
	}

	private writeExports(w: Writer) {
		const consts = Array.from(w.variables);
		const types = Array.from(w.interfaces).filter(
			(t) => !["_Prim", "Prettify", "ExtractArgs"].includes(t),
		);

		w.line("");
		w.$export({ variant: "type", keys: types });
		w.line("");
		w.$export({ variant: "obj", keys: consts });
	}

	private extractParams(path: string): string[] {
		const named = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g)?.map((p) => p.substring(1)) ?? [];
		if (path.includes("*")) named.push("*");
		return named;
	}

	private capitalize(s: string): string {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	private toCamelCaseKey(endpoint: string, method: string): string {
		const globalPrefix = this.registry.prefix;
		let path = endpoint;
		if (this.config.ignoreGlobalPrefix && globalPrefix) {
			const prefixWithSlash = globalPrefix.startsWith("/") ? globalPrefix : `/${globalPrefix}`;
			if (path.startsWith(prefixWithSlash)) {
				path = path.slice(prefixWithSlash.length);
			}
		}

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

		return result + method.slice(0, 1).toUpperCase() + method.slice(1).toLowerCase();
	}

	private async buildJsonSchemaType(json: Record<string, unknown>): Promise<string> {
		try {
			const inter = await this.schemaManager.toInterface(json);
			return inter;
		} catch (err) {
			console.error(
				`[corpus] Failed to convert json schema to TypeScript interface. ` +
					`Check your definition.\n` +
					`Schema: ${JSON.stringify(json, null, 2)}`,
			);
			throw err;
		}
	}
	private async buildSchemaType(schema: Schema): Promise<string> {
		try {
			const json = this.schemaManager.toJsonSchema(schema);
			const inter = await this.schemaManager.toInterface(json);
			return inter;
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
