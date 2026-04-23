import { ConfigManager } from "./ConfigManager/ConfigManager";
import { generateApiClient } from "./generateApiClient";
import { initialize } from "./initialize";

const action = ConfigManager.getAction();
const config = await ConfigManager.getResolvedConfig();
ConfigManager.writeConfigFile(config);

switch (action) {
	case "api":
		generateApiClient(config);
		break;
	case "init":
		await initialize(config);
		break;
}

process.exit(0);
