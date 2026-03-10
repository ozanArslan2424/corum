import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { FileWalker } from "@/FileWalker/FileWalker";
import { CError } from "@/CError/CError";
import { CResponse } from "@/CResponse/CResponse";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouteModel } from "@/Model/types/RouteModel";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";
import type { StaticRouteHandler } from "@/Route/types/StaticRouteHandler";
import type { StaticRouteDefinition } from "@/Route/types/StaticRouteDefinition";
import { _routerStore } from "@/index";

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
	Path extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<Path, B, S, P, string | CResponse> {
	constructor(
		path: Path,
		definition: StaticRouteDefinition,
		handler?: StaticRouteHandler<B, S, P>,
		model?: RouteModel<B, S, P, string | CResponse>,
	) {
		super();
		this.variant = RouteVariant.static;
		this.endpoint = this.resolveEndpoint(path, this.variant);
		this.method = Method.GET;
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.model = model;
		this.filePath = this.resolveFilePath(definition);
		this.handler = this.resolveHandler(definition, handler);
		_routerStore.get().addRoute(this);
	}

	id: RouteId;
	variant: RouteVariant;
	method: Method;
	endpoint: Path;
	pattern: RegExp;
	model?: RouteModel<B, S, P, string | CResponse> | undefined;
	handler: RouteHandler<B, S, P, string | CResponse>;
	private filePath: string;

	private resolveFilePath(definition: StaticRouteDefinition): string {
		return typeof definition === "string" ? definition : definition.filePath;
	}

	private resolveHandler(
		definition: StaticRouteDefinition,
		customHandler?: StaticRouteHandler<B, S, P>,
	): RouteHandler<B, S, P, string | CResponse> {
		if (customHandler !== undefined) {
			return async (c) => {
				const file = await FileWalker.find(this.filePath);
				if (!file) {
					console.error("File not found at:", this.filePath);
					throw CError.notFound();
				}
				const content = await file.text();
				c.res.headers.setMany({
					[CommonHeaders.ContentType]: FileWalker.getMimeType(this.filePath),
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
