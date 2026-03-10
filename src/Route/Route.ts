import { type Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { _routerStore } from "@/index";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteDefinition } from "@/Route/types/RouteDefinition";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteId } from "@/Route/types/RouteId";
import type { OrString } from "@/utils/types/OrString";

/**
 * Defines an HTTP endpoint. Accepts a {@link RouteDefinition} which can either be a plain
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

export class Route<
	Path extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> extends RouteAbstract<Path, B, S, P, R> {
	constructor(
		definition: RouteDefinition<Path>,
		handler: RouteHandler<B, S, P, R>,
		model?: RouteModel<B, S, P, R>,
	) {
		super();
		this.variant = RouteVariant.dynamic;
		this.endpoint = this.resolveEndpoint(definition, this.variant);
		this.method = this.resolveMethod(definition);
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.model = model;
		this.handler = handler;

		_routerStore.get().addRoute(this);
		if (model) {
			_routerStore.get().addModel(this, model);
		}
	}

	variant: RouteVariant;
	endpoint: Path;
	method: OrString<Method>;
	pattern: RegExp;
	id: RouteId;
	handler: RouteHandler<B, S, P, R>;
	model?: RouteModel<B, S, P, R> | undefined;

	static makeRouteId(method: string, endpoint: string): RouteId {
		return `${method.toUpperCase()} ${endpoint}`;
	}

	static makeRoutePattern(endpoint: string): RegExp {
		// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
		const regex = endpoint
			.split("/")
			.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
			.join("/");
		return new RegExp(`^${regex}$`);
	}
}
