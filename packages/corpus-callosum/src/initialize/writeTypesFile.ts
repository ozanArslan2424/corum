import type { Config } from "../Config/Config";
import { Writer } from "../Writer/Writer";

export function writesTypesFile(config: Config, typesFilePath: string) {
	const w = new Writer(typesFilePath);

	w.line(
		`import "${config.pkgPath}";`,
		``,
		`declare module "${config.pkgPath}" {`,
		`	interface Env {`,
		`		PORT: string;`,
		`		CLIENT_URL: string;`,
		`	}`,
		``,
		`	interface ContextDataInterface {}`,
		`}`,
		``,
		`export {};`,
	);

	return w.read();
}
