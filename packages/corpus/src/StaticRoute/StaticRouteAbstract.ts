import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import { BaseRouteAbstract } from "@/BaseRoute/BaseRouteAbstract";
import { RouteVariant } from "@/BaseRoute/RouteVariant";
import type { CacheDirective } from "@/CommonHeaders/CacheDirective";
import { CommonHeaders } from "@/CommonHeaders/CommonHeaders";
import type { Context } from "@/Context/Context";
import { Exception } from "@/Exception/Exception";
import { Method } from "@/Method/Method";
import { Res } from "@/Res/Res";
import type { StaticRouteCallback } from "@/StaticRoute/StaticRouteCallback";
import type { StaticRouteDefinition } from "@/StaticRoute/StaticRouteDefinition";
import { Status } from "@/Status/Status";
import { XFile } from "@/XFile/XFile";

type R = Res | string;

export abstract class StaticRouteAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
	E extends string = string,
> extends BaseRouteAbstract<B, S, P, R, E> {
	// FROM CONSTRUCTOR
	abstract readonly path: E;

	abstract readonly definition: StaticRouteDefinition;

	abstract readonly callback?: StaticRouteCallback<B, S, P>;

	// PROTECTED

	protected onFileNotFound: Func<[], Promise<Res>> = () => {
		throw new Exception(Status.NOT_FOUND.toString(), Status.NOT_FOUND);
	};

	protected get filePath(): string {
		return typeof this.definition === "string" ? this.definition : this.definition.filePath;
	}

	// ROUTE BASE PROPERTIES
	readonly variant: RouteVariant = RouteVariant.static;

	get endpoint(): E {
		return this.path;
	}

	get method(): Method {
		return Method.GET;
	}

	get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>> {
		const customHandler = this.callback;
		const isStrDef = typeof this.definition === "string";
		const defaultCaching: CacheDirective = {
			public: true,
			maxAge: 3600, // 1 hour - safe middle ground
			noCache: false,
		};
		const caching = isStrDef ? defaultCaching : (this.definition.cache ?? defaultCaching);

		return async (c) => {
			const file = new XFile(this.filePath);
			const exists = await file.exists();
			if (!exists) {
				return this.onFileNotFound();
			}

			if (customHandler !== undefined) {
				const content = await file.text();
				c.res.headers.setMany({
					[CommonHeaders.ContentType]: file.mimeType,
					[CommonHeaders.ContentLength]: content.length.toString(),
					[CommonHeaders.CacheControl]: this.formatCacheHeader(caching),
				});
				return customHandler(c, content);
			}

			let res: Res;

			if (!isStrDef && this.definition.stream) {
				res = await Res.streamFile(file, this.definition.disposition);
			} else {
				res = await Res.file(file);
			}

			res.headers.set(CommonHeaders.CacheControl, this.formatCacheHeader(caching));
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
