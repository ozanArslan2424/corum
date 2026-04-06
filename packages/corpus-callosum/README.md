# @ozanarslan/corpus-callosum

This package is still a WIP. `corpus gen` correctly generates api client however, `corpus init` only initializes an example project in an empty directory.
CLI for [@ozanarslan/corpus](https://github.com/ozanArslan2424/corpus) that generates TypeScript client code from your Corpus server.

## Usage

```bash
pnpx @ozanarslan/corpus-callosum gen -m ./src/main.ts
```

Or install as a dev dependency:

```bash
pnpm add -D @ozanarslan/corpus-callosum
```

```json
{
	"scripts": {
		"api:gen": "corpus gen -m ./src/main.ts -o ./src/generated.ts"
	}
}
```

## Requirements

Your entry file must call `.listen()` either at the top level or inside a single function.

### corpus gen Options

| Flag | Description                                                      |
| ---- | ---------------------------------------------------------------- |
| `-m` | Path to your server entry file                                   |
| `-o` | Output path for the generated file                               |
| `-p` | Path to `@ozanarslan/corpus` (defaults to the installed package) |
| `-s` | Silent mode                                                      |

```ts
export function defineConfig(config: Config): Required<Config> {
	return {
		...defaultConfig,
		...config,
	};
}

export type Config = Partial<{
	apiClientGenerator: ApiClientGeneratorConfig;
	initialize: InitializeConfig;
}>;

import type { StandardJSONSchemaV1 } from "@standard-schema/spec";

export type ApiClientGeneratorConfig = Partial<{
	/**
	 * The file path where the generated output will be written.
	 *
	 * @default "/src/corpus.gen.ts"
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
	 * Options passed to `schema["~standard"].jsonSchema.output()` for each route model.
	 * Use this to configure how your schema library handles types that don't have
	 * JSON Schema equivalents (e.g. Date, morph, predicate).
	 *
	 * @example
	 * // arktype — "just make it work"
	 * { jsonSchemaOptions: { target: "draft-07", libraryOptions: { fallback: ctx => ctx.base } } }
	 */
	jsonSchemaOptions: StandardJSONSchemaV1.Options;
}>;

export type InitializeConfig = Partial<{
	/**
	 * Casing for file and directory names,
	 *
	 * @default "pascal"
	 */
	casing: "pascal" | "camel" | "kebab";

	/**
	 * Suppress console logs.
	 *
	 * @default false
	 */
	silent: boolean;

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
	 * valibot: "1.3.1"
	 * yup: "1.7.1"
	 * zod: "4.3.6"
	 *
	 * @default null
	 */
	validationLibrary:
		| "arktype"
		| "zod"
		| "valibot"
		| "yup"
		| (string & {})
		| null;

	/**
	 * Package manager to install any missing dependencies with.
	 * Also picks up from package.json
	 * Default is bun since corpus uses bun runtime.
	 *
	 * @default "bun"
	 */
	packageManager: "bun" | "pnpm" | "npm" | null;
}>;
```
