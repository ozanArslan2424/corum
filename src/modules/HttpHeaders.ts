/** Headers is extended to include helpers and intellisense for common header names. */

import type { HttpHeaderKey } from "@/types/HttpHeaderKey";
import type { HttpHeadersInit } from "@/types/HttpHeadersInit";
import { strIsDefined } from "@/utils/strIsDefined";

export class HttpHeaders extends Headers {
	constructor(init?: HttpHeadersInit) {
		super(init);
	}

	override append(name: HttpHeaderKey, value: string): void {
		super.append(name, value);
	}

	override set(name: HttpHeaderKey, value: string): void {
		super.set(name, value);
	}

	override get(name: string): string | null {
		return super.get(name) || super.get(name.toLowerCase());
	}

	override has(name: string): boolean {
		return super.has(name) || super.has(name.toLowerCase());
	}

	combine(source: HttpHeaders, target: HttpHeaders): HttpHeaders {
		source.forEach((value, key) => {
			if (key.toLowerCase() === "set-cookie") {
				target.append(key, value);
			} else {
				target.set(key, value);
			}
		});

		return target;
	}

	innerCombine(source: HttpHeaders): HttpHeaders {
		return this.combine(source, this);
	}

	setMany(init: HttpHeadersInit): void {
		for (const [key, value] of Object.entries(init)) {
			if (!strIsDefined(value)) continue;
			this.set(key, value);
		}
	}

	static findHeaderInInit(
		init: HttpHeadersInit,
		name: HttpHeaderKey,
	): string | null {
		if (init instanceof HttpHeaders || init instanceof Headers) {
			return init.get(name);
		} else if (Array.isArray(init)) {
			return init.find((entry) => entry[0] === name)?.[1] ?? null;
		} else {
			return init[name] ?? null;
		}
	}
}
