import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { RateLimitEntry } from "@/XRateLimiter/RateLimitEntry";

// Storage interface for pluggable backends
export interface RateLimitStoreInterface {
	get(id: string): MaybePromise<RateLimitEntry | undefined>;
	set(id: string, entry: RateLimitEntry): MaybePromise<void>;
	delete(id: string): MaybePromise<void>;
	cleanup(now: number): MaybePromise<void>;
	clear(): MaybePromise<void>;
	size(): MaybePromise<number>;
}
