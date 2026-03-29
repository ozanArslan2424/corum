async function buildPackage() {
	const result = await Bun.build({
		entrypoints: ["./src/index.ts"],
		outdir: "./dist",
		target: "bun",
	});

	if (!result.success) {
		result.logs.forEach((l) => console.error(l));
		process.exit(1);
	}
}

async function buildDocs() {
	// Copy static directories
	await Bun.$`mkdir -p ./docs/dist`.quiet();
	await Bun.$`cp -r ./docs/css ./docs/dist/`.quiet();
	await Bun.$`cp -r ./docs/html ./docs/dist/`.quiet();
	await Bun.$`cp -r ./docs/markdown ./docs/dist/`.quiet();
	console.log("📁 Copied static directories");

	// Build TypeScript
	await Bun.build({
		entrypoints: ["./docs/index.ts", "./docs/convert-md.ts"],
		outdir: "./docs/dist",
		target: "bun",
		format: "esm",
	});

	console.log("⚡ Built TypeScript");
}

const start = performance.now();
await buildPackage();
await buildDocs();
const end = performance.now();
console.log(`📚 Docs built in ${(end - start).toFixed(2)}ms`);
