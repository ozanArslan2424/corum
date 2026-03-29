import crypto from "crypto";
import { strIsDefined } from "@/utils/strIsDefined";
import type { RateLimitStoreInterface } from "@/XRateLimiter/stores/RateLimitStoreInterface";
import type { RateLimitIdPrefix } from "@/XRateLimiter/types/RateLimitIdPrefix";
import type { RateLimitConfig } from "@/XRateLimiter/types/RateLimitConfig";
import { CHeaders } from "@/CHeaders/CHeaders";
import { CError } from "@/CError/CError";
import { RateLimiterFileStore } from "@/XRateLimiter/stores/RateLimiterFileStore";
import { RateLimiterMemoryStore } from "@/XRateLimiter/stores/RateLimiterMemoryStore";
import { Status } from "@/CResponse/enums/Status";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";
import { Middleware } from "@/Middleware/Middleware";
import { logFatal } from "@/utils/internalLogger";

export class XRateLimiter {
	constructor(config: Partial<RateLimitConfig> = {}) {
		this.config = { ...this.defaultConfig, ...config };
		this.store = this.resolveStore();
		this.storedSalt = this.getRandomBytes();
		this.saltRotatesAt = Date.now() + this.config.saltRotateMs;
		this.registerMiddleware();
	}

	private registerMiddleware() {
		new Middleware({
			useOn: "*",
			handler: async (c) => {
				const result = await this.getResult(c.headers);
				c.res.headers.innerCombine(result.headers);
				const exposedHeaders = Object.values(this.config.headerNames);
				c.res.headers.append(
					CommonHeaders.AccessControlExposeHeaders,
					exposedHeaders,
				);

				if (!result.success) {
					throw new CError(
						"Too many requests",
						Status.TOO_MANY_REQUESTS,
						c.res,
					);
				}
			},
		});
	}

	private readonly config: RateLimitConfig;
	private store: RateLimitStoreInterface;
	private storedSalt: string;
	private saltRotatesAt: number;

	async getResult(headers: CHeaders): Promise<{
		success: boolean;
		headers: CHeaders;
	}> {
		await this.maybeCleanStore();

		const id = this.getId(headers);
		const now = Date.now();

		// Atomic read-modify-write operation
		let entry = await this.store.get(id);

		if (entry && entry.resetAt > now) {
			entry.hits++;
		} else {
			entry = { hits: 1, resetAt: now + this.config.windowMs };
		}

		await this.store.set(id, entry);

		const max = this.getMax(id);
		const allowed = entry.hits <= max;
		const remaining = Math.max(0, max - entry.hits);
		const resetUnix = Math.ceil(entry.resetAt / 1000);

		const keys = this.config.headerNames;

		const responseHeaders = new CHeaders();
		responseHeaders.setMany({
			[keys.limit]: max.toString(),
			[keys.remaining]: remaining.toString(),
			[keys.reset]: resetUnix.toString(),
		});

		// Add Retry-After header if rate limited
		if (!allowed) {
			const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
			responseHeaders.set(keys.retryAfter, retryAfter.toString());
		}

		if (allowed) {
			return { headers: responseHeaders, success: true };
		}

		return { headers: responseHeaders, success: false };
	}

	private getId(headers: CHeaders): string {
		// --- Authenticated: hash the JWT token ---
		const authHeader = headers.get(CommonHeaders.Authorization);
		const token = authHeader?.split(" ")[1];
		if (strIsDefined(token) && token.length >= 20 && token.length <= 2048) {
			return `u:${this.hash(token, 16)}`;
		}

		// --- IP-based ---
		const ip = this.extractIp(headers);
		if (ip !== null) {
			return `i:${this.hash(ip + this.salt(), 16)}`;
		}

		// --- Fingerprint fallback ---
		const parts = [
			headers.get("user-agent") ?? "no-ua",
			headers.get("accept-language") ?? "no-lang",
			headers.get("accept-encoding") ?? "no-enc",
		];
		return `f:${this.hash(parts.join("|") + this.salt(), 16)}`;
	}

	private getMax(id: string): number {
		const prefix = id.charAt(0) as RateLimitIdPrefix;
		return this.config.limits[prefix] ?? this.config.limits.f;
	}

	private extractIp(headers: CHeaders): string | null {
		const raw =
			headers.get("cf-connecting-ip") ||
			headers.get("x-real-ip") ||
			headers.get("x-forwarded-for")?.split(",")[0]?.trim();

		return this.isValidIp(raw) ? raw : null;
	}

	private isValidIp(ip: string | null | undefined): ip is string {
		if (!strIsDefined(ip) || ip.length === 0) return false;

		// IPv4
		if (ip.includes(".")) {
			const parts = ip.split(".");
			if (parts.length !== 4) return false;
			return parts.every((p) => {
				if (!/^\d+$/.test(p)) return false;
				const n = Number(p);
				return n >= 0 && n <= 255 && p === String(n); // No leading zeros
			});
		}

		// IPv6 — delegate to the platform; avoids incomplete regex coverage
		// Node / V8 will throw on invalid addresses when used in a URL
		if (ip.includes(":")) {
			try {
				new URL(`http://[${ip}]`);
				return true;
			} catch {
				return false;
			}
		}

		return false;
	}

	private salt(): string {
		if (Date.now() > this.saltRotatesAt) {
			this.storedSalt = this.getRandomBytes();
			this.saltRotatesAt = Date.now() + this.config.saltRotateMs;
		}
		return this.storedSalt;
	}

	private async maybeCleanStore(): Promise<void> {
		const currentSize = await this.store.size();
		const shouldClean =
			Math.random() < this.config.cleanProbability ||
			currentSize > this.config.maxStoreSize;

		if (shouldClean) await this.cleanStore();
	}

	private async cleanStore(): Promise<number> {
		const now = Date.now();
		await this.store.cleanup(now);

		return await this.store.size();
	}

	private hash(data: string, len: number): string {
		return crypto.hash("sha256", data).slice(0, len);
	}

	private getRandomBytes() {
		return crypto.randomBytes(16).toString("hex");
	}

	async clearStore(): Promise<void> {
		await this.store.clear();
	}

	async getStoreSize(): Promise<number> {
		return await this.store.size();
	}

	private readonly defaultConfig: RateLimitConfig = {
		windowMs: 60_000,
		saltRotateMs: 24 * 3600 * 1000, // Daily
		cleanProbability: 0.005, // ~0.5% chance per request
		maxStoreSize: 50_000, // Trigger forced cleanup above
		storeType: "memory", // Default to memory store
		limits: { u: 120, i: 60, f: 20 },
		headerNames: {
			limit: "RateLimit-Limit",
			remaining: "RateLimit-Remaining",
			reset: "RateLimit-Reset",
			retryAfter: "Retry-After",
		},
	};

	private resolveStore(): RateLimitStoreInterface {
		switch (this.config.storeType) {
			case "file":
				return new RateLimiterFileStore(this.config.storeDir);

			case "redis": {
				const store = this.config.store;
				if (!store) {
					logFatal("store required for redis store type");
				}
				return store;
			}

			case "custom": {
				const store = this.config.store;
				if (!store) {
					logFatal("store required for custom store type");
				}
				return store;
			}

			case "memory":
			default:
				return new RateLimiterMemoryStore();
		}
	}
}
