import { log } from "@/Utils/log";

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

	t = step("building corpus package");
	const b1 = await Bun.build({
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
		target: "bun",
		tsconfig: "./tsconfig.build.json",
	});
	if (!b1.success) {
		b1.logs.forEach((l) => log.error(l));
		process.exit(1);
	}
	done("built corpus package", t);

	t = step("making dist dir");
	await Bun.$`mkdir -p ./docs/dist`.quiet();
	done("made dist dir", t);

	t = step("copying static directories");
	await Promise.all([
		Bun.$`cp -r ./src/Docs/css ./docs/dist/`.quiet(),
		Bun.$`cp -r ./src/Docs/html ./docs/dist/`.quiet(),
		Bun.$`cp -r ./src/Docs/markdown ./docs/dist/`.quiet(),
	]);
	done("copied static directories", t);

	t = step("building docs server");
	const b2 = await Bun.build({
		entrypoints: ["./src/Docs/index.ts", "./src/Docs/convert-md.ts"],
		outdir: "./docs/dist",
		target: "bun",
		format: "esm",
	});
	if (!b2.success) {
		b2.logs.forEach((l) => log.error(l));
		process.exit(1);
	}
	done("built docs server", t);
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
