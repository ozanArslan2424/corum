import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { BundleRouteConfig } from "@/BundleRoute/BundleRouteConfig";
import type { RouteModel } from "@/C";
import type { CacheDirective } from "@/CommonHeaders/CacheDirective";
import { CommonHeaders } from "@/CommonHeaders/CommonHeaders";
import type { Context } from "@/Context/Context";
import { Exception } from "@/Exception/Exception";
import { Method } from "@/Method/Method";
import { Res } from "@/Res/Res";
import { BaseRouteAbstract } from "@/BaseRoute/BaseRouteAbstract";
import { RouteVariant } from "@/BaseRoute/RouteVariant";
import { Status } from "@/Status/Status";
import { XConfig } from "@/XConfig/XConfig";
import { XFile } from "@/XFile/XFile";

type R = Res | string;

export abstract class BundleRouteAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
	E extends string = string,
> extends BaseRouteAbstract<B, S, P, R, E> {
	// FROM CONSTRUCTOR
	abstract readonly path: E;

	abstract readonly dir: string;

	abstract readonly bundleConfig?: BundleRouteConfig;

	// PROTECTED

	protected onFileNotFound: Func<[], Promise<Res | never>> = () => {
		throw new Exception(Status.NOT_FOUND.toString(), Status.NOT_FOUND);
	};

	protected defaultConfig: BundleRouteConfig = {
		cache: {
			// Vite assets are hashed (index-HASH.js), so they are safe to cache forever.
			assetsDir: {
				public: true,
				maxAge: 31536000, // 1 year
				immutable: true,
			},
			// index.html must be checked every time to see if a new version exists.
			indexHtml: "no-cache",
			// Root files (favicon, robots.txt, manifest.json) usually don't have
			// hashes in the filename, so we tell the browser to revalidate them.
			fallback: {
				public: true,
				noCache: true,
			},
		},
	};

	// ROUTE BASE PROPERTIES
	readonly variant: RouteVariant = RouteVariant.bundle;
	readonly model?: RouteModel<B, S, P, R> | undefined = undefined;

	get endpoint(): E {
		return this.path;
	}

	get method(): Method {
		return Method.GET;
	}

	get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>> {
		return async (c) => {
			const idx = "index.html";
			const pathname = c.req.urlObject.pathname;
			const subPath = pathname.startsWith(this.path) ? pathname.slice(this.path.length) : pathname;

			const relFilePath = subPath === "" || subPath === "/" ? idx : subPath;
			const targetPath = XConfig.joinPath(this.dir, relFilePath);

			let file = new XFile(targetPath);
			let exists = await file.exists();

			if (!exists && file.extension !== "html") {
				const idxPath = XConfig.joinPath(this.dir, idx);
				const idxFile = new XFile(idxPath);

				if (await idxFile.exists()) {
					file = idxFile;
					exists = true;
				}
			}

			if (!exists) {
				return await this.onFileNotFound();
			}

			const res =
				file.extension !== "html" ? await Res.streamFile(file, "inline") : await Res.file(file);

			const cacheConfig = this.bundleConfig?.cache ?? this.defaultConfig.cache;

			if (file.name === idx) {
				res.headers.set(CommonHeaders.CacheControl, this.formatCacheHeader(cacheConfig.indexHtml));
			} else if (file.path.includes("/assets/")) {
				res.headers.set(CommonHeaders.CacheControl, this.formatCacheHeader(cacheConfig.assetsDir));
			} else if (cacheConfig.fallback) {
				res.headers.set(CommonHeaders.CacheControl, this.formatCacheHeader(cacheConfig.fallback));
			}

			return res;
		};
	}

	// PRIVATE

	private formatCacheHeader(config: CacheDirective | "no-cache"): string {
		if (config === "no-cache") return "no-cache";

		const parts: string[] = [];
		if (config.noStore) return "no-store";
		if (config.noCache) return "no-cache";
		if (config.public) parts.push("public");
		if (config.maxAge !== undefined) parts.push(`max-age=${config.maxAge}`);
		if (config.immutable) parts.push("immutable");

		return parts.join(", ");
	}
}
