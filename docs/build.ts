async function buildDocs() {
	try {
		await Bun.$`rm -rf ./docs/dist`.quiet();
		console.log("🧹 Cleaned ./docs/dist folder");
	} catch {
		console.warn("⚠️  Could not clean ./docs/dist folder");
	}

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
await buildDocs();
const end = performance.now();
console.log(`📚 Docs built in ${(end - start).toFixed(2)}ms`);
