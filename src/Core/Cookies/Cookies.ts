import type { CookiesInterface } from "@/Core/Cookies/CookiesInterface";
import type { CookieOptions } from "@/Core/Cookies/CookieOptions";
import type { CookiesInit } from "@/Core/Cookies/CookiesInit";

export class Cookies implements CookiesInterface {
	constructor(init?: CookiesInit | CookiesInterface) {
		if (init instanceof Cookies) {
			for (const name of init.keys()) {
				const value = init.get(name) ?? "";
				this.set({ name, value });
			}
		} else if (Array.isArray(init)) {
			for (const opts of init) {
				this.set(opts);
			}
		} else if (init && "name" in init && "value" in init) {
			this.set(init);
		}
	}

	protected map = new Bun.CookieMap();

	toSetCookieHeaders(): Array<string> {
		return this.map.toSetCookieHeaders();
	}

	set(opts: CookieOptions): void {
		this.map.set(opts.name, opts.value, opts);
	}

	setMany(optsArr: Array<CookieOptions>): void {
		for (const opts of optsArr) {
			this.set(opts);
		}
	}

	get(name: string): string | null {
		return this.map.get(name);
	}

	has(name: string): boolean {
		return this.map.has(name);
	}

	get count(): number {
		return this.values().length;
	}

	delete(name: string): void {
		this.map.delete(name);
	}

	entries(): IterableIterator<[string, string]> {
		return this.map.entries();
	}

	values(): Array<string> {
		return Array.from(this.map.values());
	}

	keys(): Array<string> {
		return Array.from(this.map.keys());
	}
}
