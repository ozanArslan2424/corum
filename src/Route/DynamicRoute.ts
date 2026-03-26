import { Method } from "@/CRequest/enums/Method";
import { $prefixStore, $routerStore } from "@/index";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { DynamicRouteDefinition } from "@/Route/types/DynamicRouteDefinition";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteId } from "@/Route/types/RouteId";
import type { OrString } from "@/utils/types/OrString";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { RouteAbstract } from "@/Route/RouteAbstract";
import { joinPathSegments } from "@/utils/joinPathSegments";

/**
 * Defines an HTTP endpoint. Accepts a {@link DynamicRouteDefinition} which can either be a plain
 * path string (defaults to GET) or an object with a `method` and `path` for other HTTP methods.
 *
 * The handler receives a {@link Context} and can return any data, a {@link CResponse} directly,
 * or a plain web `Response` for cases where full control over the response is needed.
 * Returned data is automatically serialized by {@link CResponse} — plain objects become JSON,
 * primitives become plain text, and so on.
 *
 * An optional {@link RouteModel} can be provided to validate and parse the request body,
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
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> extends RouteAbstract<E, B, S, P, R> {
	constructor(
		definition: DynamicRouteDefinition<E>,
		handler: RouteHandler<B, S, P, R>,
		model?: RouteModel<B, S, P, R>,
	) {
		super();
		this.endpoint = this.resolveEndpoint(definition);
		this.method = this.resolveMethod(definition);
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.model = model;
		this.handler = handler;
		$routerStore.get().addRoute(this);
	}

	id: RouteId;
	method: OrString<Method>;
	endpoint: E;
	pattern: RegExp;
	handler: RouteHandler<B, S, P, R>;
	model?: RouteModel<B, S, P, R>;
	variant: RouteVariant = RouteVariant.dynamic;

	protected resolveEndpoint(definition: DynamicRouteDefinition<E>): E {
		return joinPathSegments(
			$prefixStore.get(),
			typeof definition === "string" ? definition : definition.path,
		);
	}

	protected resolveMethod(definition: DynamicRouteDefinition<E>): Method {
		return typeof definition === "string" ? Method.GET : definition.method;
	}
}
