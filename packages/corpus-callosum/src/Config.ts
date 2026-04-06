import type { ApiClientGeneratorConfig } from "./generate/ApiClientGeneratorConfig";
import type { InitializeConfig } from "./initialize/InitializeConfig";

export type Config = Partial<{
	apiClientGenerator: ApiClientGeneratorConfig;
	initialize: InitializeConfig;
}>;
