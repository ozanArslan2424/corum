import type { Config } from "./Config";
import { defaultConfig } from "./defaultConfig";

export function defineConfig(config: Config): Required<Config> {
	return {
		...defaultConfig,
		...config,
	};
}
