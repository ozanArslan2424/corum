import { defineConfig } from "tsdown";

export default defineConfig({
	entry: [
		"./src/index.ts",
		"./src/generate/ApiClientGenerator.ts",
		"./src/generate/defaultApiClientGeneratorConfig.ts",
	],
	outDir: "dist",
	format: ["esm"],
	dts: true,
	clean: true,
	minify: true,
	sourcemap: true,
	exports: true,
	deps: {
		alwaysBundle: ["corpus-utils"],
	},
});
