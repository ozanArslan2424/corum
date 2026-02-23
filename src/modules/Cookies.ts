/** Simple cookie map/jar to collect and manipulate cookies. */

import { RuntimeOptions } from "@/enums/RuntimeOptions";
import { CookiesAbstract } from "@/modules/CookiesAbstract";
import { CookiesUsingBun } from "@/modules/CookiesUsingBun";
import { CookiesUsingMap } from "@/modules/CookiesUsingMap";
import { getRuntime } from "@/modules/getRuntime";
import type { CookieOptions } from "@/types/CookieOptions";
import type { CookiesInit } from "@/types/CookiesInit";

export class Cookies extends CookiesAbstract {
	constructor(init?: CookiesInit) {
		super();

		this.instance = this.getInstance();

		if (init) {
			this.applyInit(init);
		}
	}

	private instance: CookiesAbstract;

	private getInstance(): CookiesAbstract {
		const runtime = getRuntime();

		switch (runtime) {
			case RuntimeOptions.bun:
				return new CookiesUsingBun();

			case RuntimeOptions.node:
			default:
				return new CookiesUsingMap();
		}
	}

	set(opts: CookieOptions): void {
		return this.instance.set(opts);
	}

	get(name: string): string | null {
		return this.instance.get(name);
	}

	has(name: string): boolean {
		return this.instance.has(name);
	}

	delete(opts: Pick<CookieOptions, "name" | "path" | "domain">): void {
		return this.instance.delete(opts);
	}

	entries(): IterableIterator<[string, string]> {
		return this.instance.entries();
	}

	values(): Array<string> {
		return this.instance.values();
	}

	keys(): Array<string> {
		return this.instance.keys();
	}

	toSetCookieHeaders(): Array<string> {
		return this.instance.toSetCookieHeaders();
	}
}
