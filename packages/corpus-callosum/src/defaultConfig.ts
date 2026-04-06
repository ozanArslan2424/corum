import type { Config } from "./Config";
import { defaultApiClientGeneratorConfig } from "./generate/defaultApiClientGeneratorConfig";
import { defaultInitializeConfig } from "./initialize/defaultInitializeConfig";

export const defaultConfig = {
	apiClientGenerator: defaultApiClientGeneratorConfig,
	initialize: defaultInitializeConfig,
} satisfies Config;
