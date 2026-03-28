import { Method } from "@/CRequest/enums/Method";
import { CResponse } from "@/CResponse/CResponse";
import type { RouteModel } from "@/Model/types/RouteModel";
import { $routerStore } from "@/index";
import { CError } from "@/CError/CError";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { RouteAbstract } from "@/Route/RouteAbstract";
import { XFile } from "@/XFile/XFile";
import { Status } from "@/CResponse/enums/Status";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";
import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { StaticRouteDefinition } from "@/Route/types/StaticRouteDefinition";

type R = CResponse | string;

/**
 * Defines a route that serves a static file. Accepts a path and a {@link StaticRouteDefinition}
 * which can either be a plain file path string for a standard file response, or an object
 * with `stream: true` to stream the file directly from disk — useful for large files like
 * videos, PDFs, or large assets where reading the entire file into memory is undesirable.
 *
 * An optional custom handler can be provided to intercept the file content before it is sent,
 * for example to modify headers or transform the content. Route instantiation automatically
 * registers to the router.
 *
 * @example
 * // Serve a file normally
 * new StaticRoute("/style", "assets/style.css");
 *
 * // Stream a large file
 * new StaticRoute("/video", { filePath: "assets/video.mp4", stream: true });
 *
 * // Custom handler
 * new StaticRoute("/doc", "assets/doc.txt", (c, content) => {
 *     c.res.headers.set("x-custom", "value");
 *     return content;
 * });
 */

export class StaticRoute<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<E, B, S, P, R> {
	constructor(
		path: E,
		definition: StaticRouteDefinition,
		handler?: Func<
			[context: Context<B, S, P, R>, content: string],
			MaybePromise<R>
		>,
		model?: RouteModel<B, S, P, R>,
	) {
		super();
		this.endpoint = path;
		this.method = Method.GET;
		this.id = this.resolveId(this.method, this.endpoint);
		this.model = model;
		this.filePath = this.resolveFilePath(definition);
		this.handler = this.resolveHandler(definition, handler);
		$routerStore.get().addRoute(this);
	}

	id: string;
	method: Method;
	endpoint: E;
	handler: Func<[Context<B, S, P, R>], MaybePromise<R>>;
	model?: RouteModel<B, S, P, R>;
	protected filePath: string;
	variant: RouteVariant = RouteVariant.static;

	protected resolveFilePath(definition: StaticRouteDefinition): string {
		return typeof definition === "string" ? definition : definition.filePath;
	}

	protected resolveHandler(
		definition: StaticRouteDefinition,
		customHandler?: Func<[Context<B, S, P, R>, string], MaybePromise<R>>,
	): Func<[Context<B, S, P, R>], MaybePromise<R>> {
		if (customHandler !== undefined) {
			return async (c) => {
				const file = new XFile(this.filePath);
				const exists = await file.exists();
				if (!exists) {
					throw new CError(Status.NOT_FOUND.toString(), Status.NOT_FOUND);
				}
				const content = await file.text();
				c.res.headers.setMany({
					[CommonHeaders.ContentType]: file.mimeType,
					[CommonHeaders.ContentLength]: content.length.toString(),
				});
				return customHandler(c, content);
			};
		} else if (typeof definition === "string") {
			return async () => await CResponse.file(this.filePath);
		} else {
			return async () => await CResponse.streamFile(this.filePath);
		}
	}
}
