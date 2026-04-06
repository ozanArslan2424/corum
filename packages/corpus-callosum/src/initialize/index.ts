import { registerSilentConsole } from "../utils/registerSilentConsole";
import { writeFileSync } from "fs";
import { resolve } from "path";
import { getCasingConverter } from "../utils/getCasingConverter";
import { getFilesToGenerate } from "./getFilesToGenerate";
import { PackageManager } from "./PackageManager";
import { ImportsManager } from "./ImportsManager";
import { getInitializeConfig } from "./getInitializeConfig";

const exampleModuleName = "Example";
const fallbackDirName = "corpus";

export async function initialize() {
	const config = getInitializeConfig();

	if (config.silent) registerSilentConsole();

	const cwd = resolve(process.cwd());
	const convertCase = getCasingConverter(config.casing);
	const pm = new PackageManager(config.packageManager);
	const im = new ImportsManager(
		cwd,
		convertCase(exampleModuleName),
		convertCase(fallbackDirName),
	);

	const pkgName = await pm.resolvePackageName(cwd, config.validationLibrary);

	const files = getFilesToGenerate(
		cwd,
		im,
		exampleModuleName,
		config.dbFilePath,
		config.validationLibrary,
		convertCase,
	);

	for (const file of Object.values(files)) {
		writeFileSync(file.filePath, file.content, "utf-8");
	}

	console.log(`✅ Corpus initialized in ${im.targetDir}`);
	console.log(`   App: ${pkgName}`);
}
