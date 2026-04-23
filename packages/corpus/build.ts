import dts from "bun-plugin-dts";
import { log } from "corpus-utils/internalLog";
import { Timer } from "corpus-utils/Timer";

try {
	const t = new Timer();

	t.step("cleaning dist");
	try {
		await Bun.$`rm -rf ./dist`.quiet();
		t.done("cleaned dist");
	} catch {
		log.warn("could not clean dist (might not exist yet)");
	}

	const defaultBuildConfig: Bun.BuildConfig = {
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
		target: "bun",
		tsconfig: "./tsconfig.json",
		minify: true,
		sourcemap: true,
	};

	t.step("building esm + cjs");
	const [esm, cjs] = await Promise.all([
		Bun.build({
			...defaultBuildConfig,
			plugins: [
				dts({
					compilationOptions: {
						preferredConfigPath: "./tsconfig.json",
					},
				}),
			],
			format: "esm",
			naming: "[dir]/[name].js",
		}),
		Bun.build({
			...defaultBuildConfig,
			format: "cjs",
			naming: "[dir]/[name].cjs",
		}),
	]);
	if (!esm.success) esm.logs.forEach((l) => log.error(l));
	if (!cjs.success) cjs.logs.forEach((l) => log.error(l));
	if (!esm.success || !cjs.success) process.exit(1);
	t.done("built esm + cjs");
} catch (err) {
	log.error(err);
	process.exit(1);
}
