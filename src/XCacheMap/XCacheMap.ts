import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export class XCacheMap<K = string, V = unknown> {
	private map = new Map<K, V>();

	constructor(private readonly getter: Func<[key: K], MaybePromise<V>>) {}

	async get(key: K): Promise<V> {
		if (this.map.has(key)) return this.map.get(key)!;
		const value = await this.getter(key);
		this.map.set(key, value);
		return value;
	}

	invalidate(key: K) {
		this.map.delete(key);
	}

	clear() {
		this.map.clear();
	}

	set(key: K, value: V) {
		this.map.set(key, value);
	}
}
