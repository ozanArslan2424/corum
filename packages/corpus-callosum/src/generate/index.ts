import { readFileSync, unlinkSync, writeFileSync } from "fs";
import { registerSilentConsole } from "../utils/registerSilentConsole";
import { spawnSync } from "child_process";
import { logFatal } from "corpus-utils/internalLog";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import {
	DIST_API_GENERATOR_FILE,
	API_GENERATOR_CLASS_NAME,
} from "../utils/DIST_API_GENERATOR_FILE";
import { hoistFunctionBody } from "./hoistFunctionBody";
import { parseArgs } from "util";
import { defaultApiClientGeneratorConfig } from "./defaultApiClientGeneratorConfig";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function generate() {
	const { values } = parseArgs({
		args: process.argv.slice(3),
		options: {
			main: {
				type: "string",
				short: "m",
				default: defaultApiClientGeneratorConfig.main,
			},
			package: {
				type: "string",
				short: "p",
				default: defaultApiClientGeneratorConfig.packageName,
			},
			output: {
				type: "string",
				short: "o",
				default: defaultApiClientGeneratorConfig.output,
			},
			exportRoutesAs: {
				type: "string",
				default: defaultApiClientGeneratorConfig.exportRoutesAs,
			},
			exportClientAs: {
				type: "string",
				default: defaultApiClientGeneratorConfig.exportClientAs,
			},
			generateClient: {
				type: "boolean",
				default: defaultApiClientGeneratorConfig.generateClient,
			},
			silent: {
				type: "boolean",
				short: "s",
				default: defaultApiClientGeneratorConfig.silent,
			},
		},
	});

	const mainPath = resolve(values.main);
	const packagePath = values.package;

	const cliOverrides = Object.fromEntries(
		Object.entries({
			output: values.output,
			exportRoutesAs: values.exportRoutesAs,
			exportClientAs: values.exportClientAs,
			generateClient: values.generateClient,
		}).filter(([, v]) => v !== undefined),
	);

	const tempPath = mainPath.replace(/\.ts$/, ".gen.ts");

	if (values.silent) {
		registerSilentConsole();
	}

	try {
		const lines: string[] = [`import { $registry } from "${packagePath}";`];
		const generatorPath = join(__dirname, DIST_API_GENERATOR_FILE);
		lines.push(
			`import { ${API_GENERATOR_CLASS_NAME} } from "${generatorPath}";`,
		);
		console.log(`📄 Reading main file: ${mainPath}`);
		const mainFileContents = readFileSync(mainPath, "utf-8");
		const REPLACE_TARGET = /^(void|await)?\s*\w+\.listen\(.*?\);.*$/m;

		const processedContents = hoistFunctionBody(mainFileContents);

		if (!REPLACE_TARGET.test(processedContents)) {
			logFatal(
				`⚠️  Could not find a .listen() call in: ${mainPath}.\n   Make sure your entry file calls .listen() either at the top level or inside a function.`,
			);
		}

		const replacement = [
			`const generator = new ${API_GENERATOR_CLASS_NAME}($registry.docs, ${JSON.stringify(cliOverrides)});`,
			`generator.readConfig();`,
			`await generator.generate();`,
		].join("\n");

		const patched = processedContents.replace(REPLACE_TARGET, replacement);
		lines.push(patched);
		writeFileSync(tempPath, lines.join("\n"), "utf-8");
		console.log(`🔧 Patched file written: ${tempPath}`);

		console.log(`🚀 Running generator...`);
		const result = spawnSync("bun", ["run", tempPath], {
			stdio: "inherit",
			env: process.env,
		});

		if (result.status !== 0) {
			throw new Error(`bun exited with status ${result.status}`);
		}

		console.log(`Generator completed successfully`);
	} catch (err) {
		console.error((err as Error).message);
		process.exit(1);
	} finally {
		unlinkSync(tempPath);
		console.log(`🧹 Temp file cleaned up: ${tempPath}`);
	}
}
