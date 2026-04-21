import type { Func } from "corpus-utils/Func";

import type { CacheDirective } from "@/CommonHeaders/CacheDirective";
import type { Res } from "@/Res/Res";

export type BundleRouteConfig = {
	onFileNotFound: Func<[], Promise<Res | never>>;
	onIgnore: Func<[], Promise<Res | never>>;
	assetsDir: string;
	ignore: string[];
	cache: {
		/** Strategy for index.html */
		indexHtml: CacheDirective | "no-cache";
		/** Strategy for the /assets/ folder */
		assetsDir: CacheDirective;
		/** Optional: Strategy for other root files (favicon, robots.txt, etc.) */
		fallback?: CacheDirective;
	};
};
