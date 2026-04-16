# XRateLimiter

The `XRateLimiter` class provides intelligent rate limiting with tiered identification, multiple storage backends, and privacy-preserving hashing. It automatically registers as global middleware and classifies requests by trust level: authenticated users (highest), IP addresses (moderate), or browser fingerprints (lowest).

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Configuration](#configuration)
3. [Storage Backends](#storage-backends)
4. [Identification Tiers](#identification-tiers)
5. [Headers](#headers)
6. [Redis Adapter Example](#redis-example)

</section>

## Usage

> Normally instantiation of middlewares before routes is accepted and middlewares are correctly applied. However, RateLimiter ignores bundle routes by default and MUST be instantiated after all routes are registered.

<section>

### Basic setup

```ts
import { X } from "@ozanarslan/corpus";

// Default: memory store, 120/60/20 limits per minute
new X.RateLimiter();
```

### Custom limits

```ts
new X.RateLimiter({
	limits: { u: 200, i: 100, f: 30 }, // 200 user, 100 IP, 30 fingerprint
	windowMs: 60_000, // 1 minute window
});
```

</section>

## Configuration

<section>

### RateLimitConfig

| Option           | Type                                   | Default                    | Description                         |
| ---------------- | -------------------------------------- | -------------------------- | ----------------------------------- |
| limits           | `Record<"u" \| "i" \| "f", number>`    | `{ u: 120, i: 60, f: 20 }` | Request limits per tier             |
| windowMs         | `number`                               | `60000`                    | Time window in milliseconds         |
| saltRotateMs     | `number`                               | `86400000`                 | Salt rotation interval (24h)        |
| cleanProbability | `number`                               | `0.005`                    | Chance (0-1) of cleanup per request |
| maxStoreSize     | `number`                               | `50000`                    | Force cleanup threshold             |
| storeType        | `"memory" \| "file" \| "custom"`       | `"memory"`                 | Storage backend                     |
| store            | `RateLimitStoreInterface \| undefined` | `undefined`                | Required when storeType is custom   |
| storeDir         | `string`                               | `os.tmpdir()`              | Directory for file store            |
| headerNames      | `object`                               | See below                  | Custom header names                 |

### Default header names

```ts
{
	limit: "RateLimit-Limit",
	remaining: "RateLimit-Remaining",
	reset: "RateLimit-Reset",
	retryAfter: "Retry-After"
}
```

</section>

## Storage Backends

<section>

### Memory (default)

Fastest option. Resets on server restart. Best for single-instance deployments.

```ts
new X.RateLimiter({ storeType: "memory" });
```

### File

Persistent across restarts. Good for single-instance deployments needing persistence.

```ts
new X.RateLimiter({
	storeType: "file",
	storeDir: "./data/rate-limits",
});
```

### Custom

You probably want to use Redis for multi-instance deployments, example adapter code can be found at the [bottom](#redis-example).

```ts
class CustomStore implements X.RateLimitStoreInterface {
	// ...
}

new X.RateLimiter({
	storeType: "custom",
	store: new CustomStore(),
});
```

</section>

## Identification Tiers

<section>

Requests are classified into tiers based on available identification:

| Tier        | Prefix | Source                                                | Trust    | Default Limit |
| ----------- | ------ | ----------------------------------------------------- | -------- | ------------- |
| User        | `u:`   | JWT token from `Authorization` header                 | Highest  | 120           |
| IP          | `i:`   | `CF-Connecting-IP`, `X-Real-IP`, or `X-Forwarded-For` | Moderate | 60            |
| Fingerprint | `f:`   | Hash of User-Agent, Accept-Language, Accept-Encoding  | Lowest   | 20            |

### Identification order

1. Extracts JWT from `Authorization: Bearer <token>`
2. Falls back to IP address validation
3. Falls back to browser fingerprint

### Privacy features

- IP addresses are hashed with a rotating salt (prevents long-term tracking)
- Salt rotates every 24 hours by default
- Fingerprints use hashed combinations, not raw values

</section>

## Headers

<section>

The middleware automatically sets rate limit headers on all responses:

| Header                        | Description                          |
| ----------------------------- | ------------------------------------ |
| RateLimit-Limit               | Maximum requests allowed in window   |
| RateLimit-Remaining           | Remaining requests in current window |
| RateLimit-Reset               | Unix timestamp when window resets    |
| Retry-After                   | Seconds to wait (only when limited)  |
| Access-Control-Expose-Headers | Exposes rate limit headers to CORS   |

### Custom header names

```ts
new X.RateLimiter({
	headerNames: {
		limit: "X-RateLimit-Limit",
		remaining: "X-RateLimit-Remaining",
		reset: "X-RateLimit-Reset",
		retryAfter: "Retry-After",
	},
});
```

</section>

## Redis Adapter Example

This example uses the popular "redis" package: `bun add redis`

```ts
import type { createClient } from "redis";
import type { X } from "@ozanarslan/corpus";

export class RateLimiterRedisStore implements X.RateLimitStoreInterface {
	constructor(
		private readonly redis: ReturnType<typeof createClient>,
		private readonly prefix: string = "rl:",
	) {}

	async get(id: string): Promise<X.RateLimitEntry | undefined> {
		const data = await this.redis.get(this.prefix + id);
		return data ? JSON.parse(data) : undefined;
	}

	async set(id: string, entry: X.RateLimitEntry): Promise<void> {
		await this.redis.set(this.prefix + id, JSON.stringify(entry), {
			expiration: {
				type: "PX",
				value: Math.max(0, entry.resetAt - Date.now()),
			},
		});
	}

	async delete(id: string): Promise<void> {
		await this.redis.del(this.prefix + id);
	}

	async cleanup(_now: number): Promise<void> {
		// Redis handles expiration automatically
		// This is a no-op
	}

	async clear(): Promise<void> {
		const keys = await this.redis.keys(this.prefix + "*");
		if (keys.length > 0) {
			await this.redis.del(keys);
		}
	}

	async size(): Promise<number> {
		const keys = await this.redis.keys(this.prefix + "*");
		return keys.length;
	}
}
```
