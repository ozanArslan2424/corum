import { defineConfig } from "./src/defineConfig";

export default defineConfig({
	apiClientGenerator: {
		main: "./src/main.ts",
		output: "./src/corpus.gen.ts",
		packageName: "@ozanarslan/corpus",
		exportRoutesAs: "individual",
		generateClient: true,
		exportClientAs: "CorpusApi",
		silent: false,
		// Default targets arktype. The `fallback: ctx => ctx.base` strategy silently
		// drops any unsupported constraint and keeps the rest of the schema intact,
		// which is the least-surprising behaviour for codegen purposes.
		jsonSchemaOptions: {
			fallback: (ctx: any) => ctx.base,
		},
	},
	initialize: {
		casing: "pascal",
		silent: false,
		dbFilePath: null,
		validationLibrary: null,
		packageManager: "bun",
	},
});
