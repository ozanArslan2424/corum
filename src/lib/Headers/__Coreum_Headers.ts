import { getEntries } from "@/utils/getEntries";
import type { __Coreum_HeaderKey } from "./__Coreum_HeaderKey";
import type { __Coreum_HeadersInit } from "./__Coreum_HeadersInit";

export class __Coreum_Headers extends Headers {
	constructor(init?: __Coreum_HeadersInit) {
		super(init);
	}

	override append(name: __Coreum_HeaderKey, value: string): void {
		super.append(name, value);
	}

	override set(name: __Coreum_HeaderKey, value: string): void {
		super.set(name, value);
	}

	/**
	 * @param source This is the one that's values are copied.
	 * @param target This is the one you get back.
	 * */
	static combine(source: __Coreum_Headers, target: __Coreum_Headers): __Coreum_Headers {
		source.forEach((value, key) => {
			if (key.toLowerCase() === "set-cookie") {
				target.append(key, value);
			} else {
				target.set(key, value);
			}
		});

		return target;
	}

	innerCombine(source: __Coreum_Headers): __Coreum_Headers {
		return __Coreum_Headers.combine(source, this);
	}

	setMany(init: __Coreum_HeadersInit) {
		for (const [key, value] of getEntries<string>(init)) {
			if (!value) continue;
			this.set(key, value);
		}
	}
}
