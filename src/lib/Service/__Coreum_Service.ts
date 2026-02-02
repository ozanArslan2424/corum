import { __Coreum_Method } from "@/lib/Method/__Coreum_Method";
import type { __Coreum_MiddlewareCallback } from "../Middleware/__Coreum_MiddlewareCallback";
import { __Coreum_Route } from "../Route/__Coreum_Route";
import { type __Coreum_RouteSchemas } from "../Route/__Coreum_RouteSchemas";
import { type __Coreum_RouteCallback } from "../Route/__Coreum_RouteCallback";
import { type __Coreum_RouteDefinition } from "../Route/__Coreum_RouteDefinition";

export class __Coreum_Service {
	protected makeMiddlewareHandler<D = void>(callback: __Coreum_MiddlewareCallback<D>) {
		return callback;
	}

	protected makeRouteHandler<
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
		if (typeof definition === "string") {
			definition = { method: __Coreum_Method.GET, path: definition };
		} else {
			definition = { method: definition.method, path: definition.path };
		}
		const route = new __Coreum_Route<D, R, B, S, P>(
			definition.method,
			definition.path,
			callback,
			schemas,
		);
		return route;
	}
}
