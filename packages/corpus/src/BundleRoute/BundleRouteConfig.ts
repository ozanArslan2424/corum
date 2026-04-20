import type { CacheDirective } from "@/CommonHeaders/CacheDirective";

export type BundleRouteConfig = {
	cache: {
		/** Strategy for index.html */
		indexHtml: CacheDirective | "no-cache";
		/** Strategy for the /assets/ folder */
		assetsDir: CacheDirective;
		/** Optional: Strategy for other root files (favicon, robots.txt, etc.) */
		fallback?: CacheDirective;
	};
};
