export type Config = {
	/**
	 * Suppress console logs.
	 *
	 * @default false
	 */
	silent: boolean;

	/**
	 * The server entrypoint file path.
	 *
	 * @default "./src/main.ts"
	 */
	main: string;

	/**
	 * The corpus package path.
	 *
	 * @default "@ozanarslan/corpus"
	 */
	pkgPath: string;

	/**
	 * Casing for file and directory names,
	 *
	 * @default "pascal"
	 */
	casing: "pascal" | "camel" | "kebab";

	/**
	 * Database client file path.
	 *
	 * @default null
	 */
	dbFilePath: string | null;

	/**
	 * Validation Library to generate models using.
	 * Append version number with @ if you need a specific version.
	 *
	 * Default versions:
	 * arktype: "2.2.0"
	 * yup: "1.7.1"
	 * zod: "4.3.6"
	 *
	 * @default null
	 */
	validationLibrary: "arktype" | "zod" | "yup" | null;

	/**
	 * Package manager to install any missing dependencies with.
	 * Also picks up from package.json
	 * Default is bun since corpus uses bun runtime.
	 *
	 * @default "bun"
	 */
	packageManager: "bun" | "pnpm" | "npm" | null;

	/**
	 * The file path where the generated output will be written.
	 *
	 * @default "./src/corpus.gen.ts"
	 */
	output: string;

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
	 * Controls how the API Client is exported.
	 * Set to false if you don't want the api client.
	 *
	 * @default "CorpusApi"
	 */
	exportClientAs: string | false;

	/**
	 * Options forwarded to the appropriate JSON Schema conversion library for each route model.
	 *
	 * The correct shape depends on which validation library you are using:
	 *
	 * - **zod / arktype** — passed as the second argument to `schema["~standard"].jsonSchema.output()`.
	 * Accepts `StandardJSONSchemaV1.Options`:
	 * ```ts
	 * {
	 *   target?: "draft-07" | "draft-2020-12"; // default: "draft-07"
	 *   libraryOptions?: {
	 *     fallback?: (ctx: FallbackContext) => unknown; // handle unsupported types
	 *   };
	 * }
	 * ```
	 *
	 * - **yup** — passed as the second argument to `@sodaru/yup-to-json-schema` `convertSchema()`.
	 *
	 * @link https://github.com/sodaru/yup-to-json-schema
	 *
	 * @default
	 * ```ts
	 * {
	 *   target: "draft-07",
	 *   libraryOptions: {
	 *     fallback: (ctx) => ctx.base,
	 *   },
	 * }
	 * ```
	 *
	 * @example
	 * // arktype / zod — handle unsupported types gracefully
	 * { libraryOptions: { fallback: (ctx) => ctx.base } }
	 */
	jsonSchemaOptions: Record<string, unknown>;
};

export type PartialConfig = Partial<Config>;
