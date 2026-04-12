import { ConfigManager } from "./ConfigManager/ConfigManager";
import { generateApiClient } from "./generateApiClient";
import { initialize } from "./initialize";

const action = ConfigManager.getAction();
const config = await ConfigManager.getResolvedConfig();
ConfigManager.writeConfigFile(config);

if (action === "api") {
	await generateApiClient(config);
	process.exit(0);
}

if (action === "init") {
	await initialize(config);
	process.exit(0);
}
