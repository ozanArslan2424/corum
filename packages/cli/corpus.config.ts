import { defineConfig } from "@ozanarslan/corpus-cli/config";
export default defineConfig({
	main: "./test/other/startServer.ts",
	pkgPath: "@ozanarslan/corpus",
	validationLibrary: null,
	packageManager: "bun",
	casing: "pascal",
	output: "./test/other/generated.ts",
	exportClientAs: "CorpusApi",
	// Default targets arktype. The `fallback: ctx => ctx.base` strategy silently
	// drops any unsupported constraint and keeps the rest of the schema intact,
	// which is the least-surprising behaviour for codegen purposes.
	jsonSchemaOptions: {
		target: "draft-07",
		fallback: (ctx: any) => ctx.base,
	},
});
