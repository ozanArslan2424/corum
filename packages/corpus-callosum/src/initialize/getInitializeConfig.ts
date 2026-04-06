import { existsSync } from "fs";
import { resolve } from "path";
import { ACCEPTED_PACKAGE_MANAGERS } from "../utils/ACCEPTED_PACKAGE_MANAGERS";
import { logFatal } from "corpus-utils/internalLog";
import { ACCEPTED_VALIDATION_LIBS } from "../utils/ACCEPTED_VALIDATION_LIBS";
import { parseArgs } from "util";
import { defaultInitializeConfig } from "./defaultInitializeConfig";
import type { InitializeConfig } from "./InitializeConfig";

export function getInitializeConfig(): Required<InitializeConfig> {
	const { values } = parseArgs({
		args: process.argv.slice(3),
		options: {
			casing: {
				type: "string",
				short: "c",
				default: defaultInitializeConfig.casing,
			},
			silent: {
				type: "boolean",
				short: "s",
				default: defaultInitializeConfig.silent,
			},
			db: { type: "string" },
			pm: { type: "string", default: defaultInitializeConfig.packageManager },
			validation: { type: "string" },
		},
	});

	if (values.pm && !ACCEPTED_PACKAGE_MANAGERS.includes(values.pm)) {
		logFatal(
			`"${values.pm}" is not a supported package manager. Supported options: ${ACCEPTED_PACKAGE_MANAGERS.join(", ")}`,
		);
	}

	if (
		values.validation &&
		!ACCEPTED_VALIDATION_LIBS.some((lib) => values.validation!.startsWith(lib))
	) {
		logFatal(
			`"${values.validation}" is not a supported validation library. Supported options: ${ACCEPTED_VALIDATION_LIBS.join(", ")}`,
		);
	}

	const cliOverrides = {
		casing: values.casing as InitializeConfig["casing"],
		silent: values.silent,
		dbFilePath: values.db,
		packageManager: values.pm as InitializeConfig["packageManager"],
		validationLibrary: values.validation,
	};

	// From file
	const extensions = [".ts", ".js"];
	const base = resolve(process.cwd(), "corpus.config");
	const configPath = extensions.map((ext) => base + ext).find(existsSync);
	const userConfigFile = configPath
		? require(configPath).default?.initialize
		: {};

	return {
		...defaultInitializeConfig,
		...userConfigFile,
		...cliOverrides,
	};
}
