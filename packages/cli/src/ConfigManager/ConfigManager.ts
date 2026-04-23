import fs from "node:fs";
import path from "node:path";
import { parseArgs } from "util";

import * as p from "@clack/prompts";
import { logFatal, log } from "corpus-utils/internalLog";

import type { Config, PartialConfig } from "../Config/Config";
import { ACCEPTED_PACKAGE_MANAGERS } from "../utils/ACCEPTED_PACKAGE_MANAGERS";
import { ACCEPTED_VALIDATION_LIBS } from "../utils/ACCEPTED_VALIDATION_LIBS";
import { ACTIONS, type Action } from "../utils/ACTIONS";
import { registerSilentConsole } from "../utils/registerSilentConsole";
import { Writer } from "../Writer/Writer";

export class ConfigManager {
	static getAction(): Action {
		const args = process.argv;
		const action = args[2] as Action | undefined;

		if (!action || !ACTIONS.includes(action)) {
			log.bold("No action provided. Available actions:");
			log.info("  api   — generate types and API client from your server entry file");
			log.info("          example: corpus api -m ./src/main.ts -o ./src/corpus.gen.ts");
			log.info("  init  — scaffold an empty Corpus project");
			log.info("          example: corpus init");
			logFatal("Please provide an action and try again.");
		}
		return action;
	}

	static getDefaultConfig(): Config {
		return {
			silent: false,
			main: "./src/main.ts",
			pkgPath: "@ozanarslan/corpus",
			casing: "pascal",
			validationLibrary: null,
			packageManager: "bun",
			output: "./src/corpus.gen.ts",
			exportClientAs: "CorpusApi",
			ignoreGlobalPrefix: false,
			jsonSchemaOptions: {
				fallback: (ctx: any) => ctx.base,
			},
		};
	}

	static getFileConfig(): PartialConfig {
		const extensions = [".ts", ".js"];
		const base = path.resolve(process.cwd(), "corpus.config");
		const configPath = extensions.map((ext) => base + ext).find(fs.existsSync);
		const fileC: PartialConfig = configPath ? require(configPath).default : {};
		return fileC;
	}

	static getFlagConfig(): PartialConfig {
		const args = process.argv;

		const { values: flagC } = parseArgs({
			args: args.slice(3),
			options: {
				main: { type: "string", short: "m" },
				pkgPath: { type: "string", short: "p" },
				output: { type: "string", short: "o" },
				silent: { type: "boolean", short: "s" },
			},
		});

		return flagC;
	}

	static async promptConfig(defaults: Config): Promise<PartialConfig> {
		p.intro("Corpus config wizard");

		const main = await p.text({
			message: "Server entry file:",
			defaultValue: defaults.main,
			placeholder: defaults.main,
		});

		const output = await p.text({
			message: "Output file path:",
			defaultValue: defaults.output,
			placeholder: defaults.output,
		});

		const pkgPath = await p.text({
			message: "Corpus package path:",
			defaultValue: defaults.pkgPath,
			placeholder: defaults.pkgPath,
		});

		const casing = await p.select({
			message: "Type casing:",
			options: [
				{ label: "PascalCase", value: "pascal" },
				{ label: "camelCase", value: "camel" },
				{ label: "snake_case", value: "snake" },
			],
			initialValue: defaults.casing,
		});

		const exportClientAs = await p.text({
			message: "Export API client as:",
			defaultValue: defaults.exportClientAs,
			placeholder: defaults.exportClientAs,
		});

		const ignoreGlobalPrefix = await p.confirm({
			message: "Ignore global prefix for generated keys?",
			initialValue: defaults.ignoreGlobalPrefix,
		});

		const packageManager = await p.select({
			message: "Package manager:",
			options: ACCEPTED_PACKAGE_MANAGERS.map((pm) => ({
				label: pm,
				value: pm,
			})),
			initialValue: defaults.packageManager,
		});

		const validationLibrary = await p.select({
			message: "Validation library:",
			options: [
				...ACCEPTED_VALIDATION_LIBS.map((lib) => ({ label: lib, value: lib })),
				{ label: "none", value: "none" },
			],
			initialValue: "none",
		});

		const dbFilePath = await p.text({
			message: "Database file path (leave blank to skip):",
			defaultValue: "",
			placeholder: "leave blank to skip",
		});

		const silent = await p.confirm({
			message: "Suppress console output?",
			initialValue: defaults.silent,
		});

		// Handle cancellation (Ctrl+C on any prompt returns a symbol)
		const allAnswers = {
			main,
			output,
			pkgPath,
			casing,
			exportClientAs,
			ignoreGlobalPrefix,
			packageManager,
			validationLibrary,
			dbFilePath,
			silent,
		};
		if (Object.values(allAnswers).some((v) => p.isCancel(v))) {
			p.cancel("Config wizard cancelled.");
			process.exit(0);
		}

		p.outro("Config ready.");

		return {
			main: main as string,
			output: output as string,
			pkgPath: pkgPath as string,
			casing: casing as Config["casing"],
			exportClientAs: exportClientAs as string,
			ignoreGlobalPrefix: ignoreGlobalPrefix as boolean,
			packageManager: packageManager as Config["packageManager"],
			validationLibrary:
				validationLibrary === "none" ? null : (validationLibrary as Config["validationLibrary"]),
			silent: silent as boolean,
		};
	}
	static async getResolvedConfig(): Promise<Config> {
		const flagC = this.getFlagConfig();
		const fileC = this.getFileConfig();
		const defC = this.getDefaultConfig();

		function use<T>(flag: T | null | undefined, file: T | null | undefined, def: T): T {
			if (flag != null) return flag;
			if (file != null) return file;
			return def;
		}

		// Merge file config over defaults first so the wizard shows sensible defaults.
		const mergedDefaults: Config = {
			silent: use(null, fileC.silent, defC.silent),
			casing: use(null, fileC.casing, defC.casing),
			main: use(null, fileC.main, defC.main),
			packageManager: use(null, fileC.packageManager, defC.packageManager),
			pkgPath: use(null, fileC.pkgPath, defC.pkgPath),
			validationLibrary: use(null, fileC.validationLibrary, defC.validationLibrary),
			exportClientAs: use(null, fileC.exportClientAs, defC.exportClientAs),
			ignoreGlobalPrefix: use(null, fileC.ignoreGlobalPrefix, defC.ignoreGlobalPrefix),
			output: use(null, fileC.output, defC.output),
			jsonSchemaOptions: use(null, fileC.jsonSchemaOptions, defC.jsonSchemaOptions),
		};

		const hasFlags = !!(
			flagC.main ??
			flagC.output ??
			flagC.pkgPath ??
			flagC.casing ??
			flagC.packageManager ??
			flagC.exportClientAs ??
			flagC.validationLibrary ??
			flagC.silent
		);

		const promptC: PartialConfig = hasFlags
			? {}
			: this.configFileExists()
				? {}
				: await this.promptConfig(mergedDefaults);

		const config: Config = {
			silent: use(flagC.silent, promptC.silent, mergedDefaults.silent),
			casing: use(flagC.casing, promptC.casing, mergedDefaults.casing),
			main: use(flagC.main, promptC.main, mergedDefaults.main),
			packageManager: use(
				flagC.packageManager,
				promptC.packageManager,
				mergedDefaults.packageManager,
			),
			pkgPath: use(flagC.pkgPath, promptC.pkgPath, mergedDefaults.pkgPath),
			validationLibrary: use(
				flagC.validationLibrary,
				promptC.validationLibrary,
				mergedDefaults.validationLibrary,
			),
			exportClientAs: use(
				flagC.exportClientAs,
				promptC.exportClientAs,
				mergedDefaults.exportClientAs,
			),
			ignoreGlobalPrefix: use(
				flagC.ignoreGlobalPrefix,
				promptC.ignoreGlobalPrefix,
				mergedDefaults.ignoreGlobalPrefix,
			),
			output: use(flagC.output, promptC.output, mergedDefaults.output),
			jsonSchemaOptions: use(null, fileC.jsonSchemaOptions, defC.jsonSchemaOptions),
		};

		if (config.silent) {
			registerSilentConsole();
		}

		return config;
	}

	static writeConfigFile(config: Config): void {
		if (this.configFileExists()) return;

		const filePath = path.resolve(process.cwd(), "corpus.config.ts");
		const w = new Writer(filePath);

		w.$import({
			keys: ["defineConfig"],
			from: "@ozanarslan/corpus-cli/config",
		});
		w.line("export default defineConfig({");
		w.pair("main", w.str(config.main));
		w.pair("pkgPath", w.str(config.pkgPath));
		w.pair(
			"validationLibrary",
			config.validationLibrary ? w.str(config.validationLibrary) : "null",
		);
		w.pair("packageManager", w.str(config.packageManager ?? "bun"));
		w.pair("casing", w.str(config.casing));
		w.pair("output", w.str(config.output));
		w.pair("exportClientAs", config.exportClientAs ? w.str(config.exportClientAs) : "false");
		w.$comment("Default targets arktype. The `fallback: ctx => ctx.base` strategy silently");
		w.$comment("drops any unsupported constraint and keeps the rest of the schema intact,");
		w.$comment("which is the least-surprising behaviour for codegen purposes.");
		w.line("jsonSchemaOptions: {");
		w.tab(`target: "draft-07",`);
		w.tab("fallback: (ctx: any) => ctx.base,", 2);
		w.line("}");
		w.untab("})");
		log.info(`Config written to corpus.config.ts`);
	}

	static configFileExists() {
		const filePath = path.resolve(process.cwd(), "corpus.config.ts");
		return fs.existsSync(filePath);
	}
}
