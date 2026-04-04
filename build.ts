import { log } from "@/Utils/log";
import dts from "bun-plugin-dts";

function ms(start: number) {
	const elapsed = performance.now() - start;
	return elapsed >= 1000
		? `\x1b[31m${(elapsed / 1000).toFixed(2)}s\x1b[0m`
		: `\x1b[33m${elapsed.toFixed(2)}ms\x1b[0m`;
}

function step(label: string) {
	log.step(label);
	return performance.now();
}

function done(label: string, start: number) {
	log.success(`${label} ${ms(start)}`);
}

async function build() {
	let t: number;

	t = step("cleaning dist");
	try {
		await Bun.$`rm -rf ./dist`.quiet();
		done("cleaned dist", t);
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

	t = step("building esm + cjs");
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
	done("built esm + cjs", t);
}

try {
	let t: number;
	t = step("started");
	await build();
	done("done", t);
} catch (err) {
	log.error(err);
	process.exit(1);
}
