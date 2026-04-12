import type { RouteConfig } from "@/Route/RouteConfig";
import type { DynamicRouteDefinition } from "@/DynamicRoute/DynamicRouteDefinition";
import { DynamicRouteAbstract } from "@/DynamicRoute/DynamicRouteAbstract";
import type { DynamicRouteCallback } from "@/DynamicRoute/DynamicRouteCallback";

/**
 * Defines an HTTP endpoint. Accepts a {@link DynamicRouteDefinition} which can either be a plain
 * path string (defaults to GET) or an object with a `method` and `path` for other HTTP methods.
 *
 * The handler receives a {@link Context} and can return any data, a {@link CResponse} directly,
 * or a plain web `Response` for cases where full control over the response is needed.
 * Returned data is automatically serialized by {@link CResponse} — plain objects become JSON,
 * primitives become plain text, and so on.
 *
 * An optional {@link RouteConfig} can be provided to validate and parse the request body,
 * URL params, and search params — the parsed results are typed and available on the context.
 *
 * Route instantiation automatically registers to the router.
 *
 * @example
 * // GET /users
 * new Route("/users", () => [{ id: 1 }]);
 *
 * // POST /users with typed body
 * new Route({ method: C.Method.POST, path: "/users" }, (c) => {
 *     return { created: c.body.name };
 * }, { body: UserModel });
 */

export class DynamicRoute<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> extends DynamicRouteAbstract<B, S, P, R, E> {
	constructor(
		readonly definition: DynamicRouteDefinition<E>,
		readonly callback: DynamicRouteCallback<B, S, P, R>,
		readonly model?: RouteConfig<B, S, P, R>,
	) {
		super();
		this.register();
	}
}
