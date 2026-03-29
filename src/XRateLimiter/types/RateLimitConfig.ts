import type { RateLimitStoreInterface } from "@/XRateLimiter/stores/RateLimitStoreInterface";
import type { RateLimitIdPrefix } from "@/XRateLimiter/types/RateLimitIdPrefix";

export type RateLimitConfig = {
	/**
	 * Limits based on identifier type:
	 * u: Authenticated users — higher limit, accountable identity (e.g., 120 requests)
	 * i: IP-based — moderate, may be shared (NAT, proxies) (e.g., 60 requests)
	 * f: Fingerprint / anonymous — lowest, least trustworthy (e.g., 20 requests)
	 * */
	limits: Record<RateLimitIdPrefix, number>;

	/** Time window in milliseconds during which the rate limit applies (default: 60,000ms = 1 minute) */
	windowMs: number;

	/** How often to rotate the salt used for hashing identifiers (default: 24h)
	 * Prevents long-term tracking and adds an extra layer of privacy */
	saltRotateMs: number;

	/** Probability (0-1) of triggering a cleanup of expired entries on each request
	 * Balances memory usage against performance (default: 0.005 = 0.5%) */
	cleanProbability: number;

	/** Maximum number of entries before forcing a cleanup
	 * Prevents unbounded memory growth (default: 50,000) */
	maxStoreSize: number;

	/** Storage backend type:
	 * - memory: Fastest, but resets on server restart (default)
	 * - file: Persistent across restarts, good for single instance
	 * - redis: Distributed, for multi-instance deployments
	 * - custom: Bring your own store implementation
	 */
	storeType: "memory" | "file" | "redis" | "custom";
	store?: RateLimitStoreInterface;

	/** Directory path for file-based storage (required when storeType = "file") */
	storeDir?: string;

	/**
	 * Customizable HTTP header names for rate limit information.
	 * Allows integration with different API conventions or frontend expectations.
	 *
	 * @example
	 * // Custom header names (e.g., for legacy systems)
	 * headerNames: {
	 *   limit: "X-RateLimit-Limit",
	 *   remaining: "X-RateLimit-Remaining",
	 *   reset: "X-RateLimit-Reset",
	 *   retryAfter: "Retry-After"
	 * }
	 *
	 * @default Uses standard RateLimit-* headers as defined in IETF draft:
	 * - limit: "RateLimit-Limit"
	 * - remaining: "RateLimit-Remaining"
	 * - reset: "RateLimit-Reset"
	 * - retryAfter: "Retry-After"
	 */
	headerNames: {
		/** Header name for the maximum allowed requests in the current window */
		limit: string;
		/** Header name for the remaining requests in the current window */
		remaining: string;
		/** Header name for the timestamp (Unix seconds) when the window resets */
		reset: string;
		/** Header name for seconds to wait before retrying when rate limited */
		retryAfter: string;
	};
};
