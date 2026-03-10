import { Method } from "@/Request/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { FileWalker } from "@/FileWalker/FileWalker";
import { HttpError } from "@/Error/HttpError";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouteModel } from "@/Model/types/RouteModel";
import { _routerStore } from "@/index";
import { CommonHeaders } from "@/Headers/enums/CommonHeaders";
import type { StaticRouteHandler } from "@/Route/types/StaticRouteHandler";

/**
 * The object to define a route that serves a static file. Can be instantiated with "new" or inside a controller
 * with {@link ControllerAbstract.staticRoute}. The callback recieves the {@link Context} and can
 * return {@link HttpResponse} or any data. Route instantiation automatically registers
 * to the router.
 * */

export class StaticRoute<
	Path extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<Path, B, S, P, string> {
	constructor(
		path: Path,
		private filePath: string,
		handler?: StaticRouteHandler<B, S, P>,
		model?: RouteModel<B, S, P, string>,
	) {
		super();
		this.variant = RouteVariant.static;
		this.endpoint = this.resolveEndpoint(path, this.variant);
		this.method = Method.GET;
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.model = model;

		if (handler) {
			this.handler = async (c) => {
				const content = await this.defaultHandler(c);
				return handler(c, content);
			};
		} else {
			this.handler = this.defaultHandler;
		}

		_routerStore.get().addRoute(this);
	}

	id: RouteId;
	variant: RouteVariant;
	method: Method;
	endpoint: Path;
	pattern: RegExp;
	model?: RouteModel<B, S, P, string> | undefined;
	handler: RouteHandler<B, S, P, string>;

	private defaultHandler: RouteHandler<B, S, P, string> = async (c) => {
		const file = await FileWalker.find(this.filePath);
		if (!file) {
			console.error("File not found at:", this.filePath);
			throw HttpError.notFound();
		}
		const content = await file.text();

		c.res.headers.setMany({
			[CommonHeaders.ContentType]: FileWalker.getMimeType(this.filePath),
			[CommonHeaders.ContentLength]: content.length.toString(),
		});

		return content;
	};
}
