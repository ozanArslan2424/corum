import { __Coreum_Method } from "@/lib/Method/__Coreum_Method";
import { __Coreum_getGlobalPrefix } from "@/lib/globalPrefix/__Coreum_getGlobalPrefix";
import { __Coreum_Route } from "@/lib/Route/__Coreum_Route";
import type { __Coreum_RouteCallback } from "@/lib/Route/__Coreum_RouteCallback";
import type { __Coreum_RouteDefinition } from "@/lib/Route/__Coreum_RouteDefinition";
import type { __Coreum_RouteSchemas } from "@/lib/Route/__Coreum_RouteSchemas";
import { textIsDefined } from "@/utils/textIsDefined";
import { joinPathSegments } from "@/utils/joinPathSegments";

export class __Coreum_Controller {
	constructor(private readonly prefix?: string) {}

	public readonly routes: __Coreum_Route<any, any, any, any, any>[] = [];

	public route<
		D = void,
		R extends unknown = unknown,
		B extends unknown = unknown,
		S extends unknown = unknown,
		P extends unknown = unknown,
	>(
		definition: __Coreum_RouteDefinition,
		callback: __Coreum_RouteCallback<D, R, B, S, P>,
		schemas?: __Coreum_RouteSchemas<R, B, S, P>,
	): __Coreum_Route<D, R, B, S, P> {
		const method = typeof definition === "string" ? __Coreum_Method.GET : definition.method;
		const rawPath = typeof definition === "string" ? definition : definition.path;
		const globalPrefix = __Coreum_getGlobalPrefix();

		const path = textIsDefined(globalPrefix)
			? joinPathSegments(globalPrefix, this.prefix, rawPath)
			: joinPathSegments(this.prefix, rawPath);

		definition = { method, path };

		const route = new __Coreum_Route<D, R, B, S, P>(method, path, callback, schemas);
		this.routes.push(route);
		return route;
	}
}
