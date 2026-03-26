import { Method } from "@/CRequest/enums/Method";
import { CResponse } from "@/CResponse/CResponse";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { StaticRouteHandler } from "@/Route/types/StaticRouteHandler";
import type { StaticRouteDefinition } from "@/Route/types/StaticRouteDefinition";
import { $routerStore } from "@/index";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { OrString } from "@/utils/types/OrString";
import { CError } from "@/CError/CError";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { RouteAbstract } from "@/Route/RouteAbstract";
import { XFile } from "@/XFile/XFile";
import { Status } from "@/CResponse/enums/Status";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";

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

type R = CResponse | string;

export class StaticRoute<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<E, B, S, P, R> {
	constructor(
		path: E,
		definition: StaticRouteDefinition,
		handler?: StaticRouteHandler<B, S, P, R>,
		model?: RouteModel<B, S, P, R>,
	) {
		super();
		this.endpoint = path;
		this.method = Method.GET;
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.model = model;
		this.filePath = this.resolveFilePath(definition);
		this.handler = this.resolveHandler(definition, handler);
		$routerStore.get().addRoute(this);
	}

	id: RouteId;
	method: OrString<Method>;
	endpoint: E;
	pattern: RegExp;
	handler: RouteHandler<B, S, P, R>;
	model?: RouteModel<B, S, P, R>;
	protected filePath: string;
	variant: RouteVariant = RouteVariant.static;

	protected resolveFilePath(definition: StaticRouteDefinition): string {
		return typeof definition === "string" ? definition : definition.filePath;
	}

	protected resolveHandler(
		definition: StaticRouteDefinition,
		customHandler?: StaticRouteHandler<B, S, P, R>,
	): RouteHandler<B, S, P, R> {
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
