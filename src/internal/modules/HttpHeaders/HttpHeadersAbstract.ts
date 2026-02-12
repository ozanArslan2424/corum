import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpHeaderKey } from "@/internal/modules/HttpHeaders/types/HttpHeaderKey";
import type { HttpHeadersInit } from "@/internal/modules/HttpHeaders/types/HttpHeadersInit";

import { getEntries } from "@/internal/utils/getEntries";
import { textIsDefined } from "@/internal/utils/textIsDefined";

export abstract class HttpHeadersAbstract
	extends Headers
	implements HttpHeadersInterface
{
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

	combine(
		source: HttpHeadersInterface,
		target: HttpHeadersInterface,
	): HttpHeadersInterface {
		source.forEach((value, key) => {
			if (key.toLowerCase() === "set-cookie") {
				target.append(key, value);
			} else {
				target.set(key, value);
			}
		});

		return target;
	}

	innerCombine(source: HttpHeadersInterface): HttpHeadersInterface {
		return this.combine(source, this);
	}

	setMany(init: HttpHeadersInit): void {
		for (const [key, value] of getEntries<string>(init)) {
			if (!textIsDefined(value)) continue;
			this.set(key, value);
		}
	}
}
