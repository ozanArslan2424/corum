async function build() {
	await Bun.$`mkdir -p ./dist`.quiet();

	await Promise.all([
		Bun.$`cp -r ./src/html ./dist/html`.quiet(),
		Bun.$`cp -r ./src/css ./dist/css`.quiet(),
		Bun.$`cp -r ./src/js ./dist/js`.quiet(),
		Bun.$`cp -r ./src/md ./dist/md`.quiet(),
	]);

	const b2 = await Bun.build({
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
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
