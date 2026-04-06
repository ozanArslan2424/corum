import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

export type ApiClientGeneratorConfig = Partial<{
	/**
	 * The server entrypoint file path.
	 *
	 * @default "./src/main.ts"
	 */
	main: string;

	/**
	 * The file path where the generated output will be written.
	 *
	 * @default "./src/corpus.gen.ts"
	 */
	output: string;

	/**
	 * The corpus package path.
	 *
	 * @default "@ozanarslan/corpus"
	 */
	packageName: string;

	/**
	 * Suppress console logs.
	 *
	 * @default false
	 */
	silent: boolean;

	/**
	 * Controls how the paths object is exported.
	 *
	 * @default "individual"
	 *
	 * @example
	 * // pathsExport: "individual"
	 * export { path1, path2 };
	 *
	 * @example
	 * // pathsExport: "default"
	 * export default { path1, path2 };
	 *
	 * @example
	 * // pathsExport: "API" // or any other string for the object name
	 * export const API = { path1, path2 };
	 */
	exportRoutesAs: "individual" | "default" | (string & {});

	/**
	 * Whether to generate a typed API client class alongside the route constants.
	 *
	 * @default true
	 */
	generateClient: boolean;

	/**
	 * Controls how the API Client is exported, generateClient must be true.
	 *
	 * @default "CorpusApi"
	 */
	exportClientAs: string;

	/**
	 * Options passed to "@standard-community/standard-json".toJsonSchema for each route model.
	 * Use this to configure how your schema library handles types that don't have
	 * JSON Schema equivalents (e.g. Date, morph, predicate).
	 *
	 * @example
	 * // arktype — "just make it work"
	 * { jsonSchemaOptions: { fallback: ctx => ctx.base } }
	 */
	jsonSchemaOptions: StandardJSONSchemaV1.Options["libraryOptions"];
}>;
