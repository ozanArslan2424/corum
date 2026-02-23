import type { ConfigEnvKey } from "@/types/ConfigEnvKey";
import type { ConfigValueParser } from "@/types/ConfigValueParser";
import path from "path";

export class Config {
	static get env(): NodeJS.ProcessEnv {
		if (typeof Bun !== "undefined") {
			return Bun.env;
		}

		if (typeof process !== "undefined" && process?.env) {
			return process.env;
		}

		return {};
	}

	static cwd() {
		return process.cwd();
	}

	static resolvePath(...paths: string[]) {
		return path.resolve(...paths);
	}

	static get<T = string>(
		key: ConfigEnvKey,
		opts?: { parser?: ConfigValueParser<T>; fallback?: T },
	): T {
		const value = this.env[key];
		if (value !== undefined && value !== "") {
			return opts?.parser ? opts?.parser(value) : (value as T);
		}

		if (opts?.fallback !== undefined) {
			return opts?.fallback;
		}

		throw new Error(`${key} doesn't exist in env`);
	}

	static set(key: string, value: string) {
		this.env[key] = value;
	}
}
