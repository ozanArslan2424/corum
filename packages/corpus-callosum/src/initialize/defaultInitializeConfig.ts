import type { InitializeConfig } from "./InitializeConfig";

export const defaultInitializeConfig = {
	casing: "pascal",
	silent: false,
	dbFilePath: null,
	validationLibrary: null,
	packageManager: "bun",
} satisfies Required<InitializeConfig>;
