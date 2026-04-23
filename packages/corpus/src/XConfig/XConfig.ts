import path from "path";

import type { Func } from "corpus-utils/Func";
import { log } from "corpus-utils/internalLog";
import type { OrString } from "corpus-utils/OrString";
import { strIsDefined } from "corpus-utils/strIsDefined";

import type { Env } from "@/types.d.ts";

export class XConfig {
	static get runtime(): string {
		if (typeof Bun !== "undefined") {
			return "bun";
		}

		// oxlint-disable-next-line typescript/no-unnecessary-condition
		if (typeof process?.env !== "undefined") {
			return "node";
		}

		log.warn("⚠️ Runtime isn't Bun or NodeJS. Features may not be available. App might not start.");
		return "unknown";
	}

	static get nodeEnv(): OrString<"development" | "production" | "test"> {
		return this.env.NODE_ENV ?? "development";
	}

	static get env(): NodeJS.ProcessEnv {
		switch (this.runtime) {
			case "bun":
				return Bun.env;
			case "node":
				return process.env;
			default:
				log.warn("⚠️ process.env wasn't available. Your environment variables are in memory.");
				return {};
		}
	}

	static cwd() {
		return process.cwd();
	}

	static resolvePath(...paths: string[]) {
		return path.resolve(...paths);
	}

	static joinPath(...paths: string[]) {
		return path.join(...paths);
	}

	static get<T = string>(
		key: OrString<keyof Env>,
		opts?: { parser?: Func<[raw: string], T>; fallback?: T },
	): T {
		const value = this.env[key];

		if (strIsDefined(value)) {
			return opts?.parser ? opts.parser(value) : (value as T);
		}

		if (opts?.fallback !== undefined) {
			return opts.fallback;
		}

		log.warn(`${key} doesn't exist in env`);
		return undefined as T;
	}

	static set(key: string, value: string | number | boolean): void {
		if (typeof value === "number") {
			this.env[key] = value.toString();
			return;
		}

		if (typeof value === "boolean") {
			this.env[key] = value ? "true" : "false";
			return;
		}

		this.env[key] = value;
	}
}
