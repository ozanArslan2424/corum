async function build() {
	const b1 = await Bun.build({
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
		target: "bun",
		tsconfig: "./tsconfig.build.json",
	});
	if (!b1.success) {
		b1.logs.forEach((l) => console.error(l));
		process.exit(1);
	}

	await Bun.$`mkdir -p ./docs/dist`.quiet();

	await Promise.all([
		Bun.$`cp -r ./src/Docs/css ./docs/dist/`.quiet(),
		Bun.$`cp -r ./src/Docs/html ./docs/dist/`.quiet(),
		Bun.$`cp -r ./src/Docs/markdown ./docs/dist/`.quiet(),
	]);

	const b2 = await Bun.build({
		entrypoints: ["./src/Docs/index.ts", "./src/Docs/convert-md.ts"],
		outdir: "./docs/dist",
		target: "bun",
		format: "esm",
	});
	if (!b2.success) {
		b2.logs.forEach((l) => console.error(l));
		process.exit(1);
	}
}

try {
	await build();
} catch (err) {
	console.error(err);
	process.exit(1);
}
