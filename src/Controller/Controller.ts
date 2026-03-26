import { DynamicRoute } from "@/Route/DynamicRoute";
import { StaticRoute } from "@/Route/StaticRoute";
import type { ControllerOptions } from "@/Controller/types/ControllerOptions";
import type { RouteId } from "@/Route/types/RouteId";
import { joinPathSegments } from "@/utils/joinPathSegments";
import type { DynamicRouteDefinition } from "@/Route/types/DynamicRouteDefinition";
import type { Func } from "@/utils/types/Func";
import type { Context } from "@/Context/Context";
import type { MaybePromise } from "@/utils/types/MaybePromise";

/**
 * Base class for grouping related routes under a shared prefix and optional middleware.
 * Extend this class to create your own controllers.
 *
 * All routes registered via {@link Controller.route} and {@link Controller.staticRoute}
 * automatically inherit the controller's prefix and run `beforeEach` before the handler if set.
 *
 * @example
 * class UserController extends ControllerAbstract {
 *     constructor() {
 *         super({ prefix: "/users" });
 *     }
 *
 *     getAll = this.route("/", () => getAllUsers());
 *
 *     create = this.route({ method: C.Method.POST, path: "/" }, (c) => createUser(c.body));
 *
 *     avatar = this.staticRoute("/avatar", { filePath: "assets/avatar.png", stream: true });
 * }
 *
 * new UserController();
 */

export abstract class Controller {
	constructor(opts?: ControllerOptions) {
		this.prefix = opts?.prefix;
		this.beforeEach = opts?.beforeEach;
	}

	routeIds: Set<RouteId> = new Set<RouteId>();
	protected prefix?: string;
	protected beforeEach?: Func<[context: Context], MaybePromise<void>>;

	/**
	 * Registers a dynamic route under this controller. Behaves identically to {@link DynamicRoute}
	 * but automatically prepends the controller prefix and runs `beforeEach` before the handler.
	 */
	protected route<
		E extends string = string,
		B = unknown,
		S = unknown,
		P = unknown,
		R = unknown,
	>(
		...args: ConstructorParameters<typeof DynamicRoute<E, B, S, P, R>>
	): DynamicRoute<E, B, S, P, R> {
		const [definition, handler, model] = args;

		const route = new DynamicRoute(
			this.resolveRouteDefinition(definition),
			async (ctx) => {
				await this.beforeEach?.(ctx);
				return handler(ctx);
			},
			model,
		);
		this.routeIds.add(route.id);
		return route;
	}

	/**
	 * Registers a static file route under this controller. Behaves identically to {@link StaticRoute}
	 * but automatically prepends the controller prefix.
	 */
	protected staticRoute<
		E extends string = string,
		B = unknown,
		S = unknown,
		P = unknown,
	>(
		...args: ConstructorParameters<typeof StaticRoute<E, B, S, P>>
	): StaticRoute<E, B, S, P> {
		const [path, filePath, handler, model] = args;
		const route = new StaticRoute(
			joinPathSegments<E>(this.prefix, path),
			filePath,
			handler,
			model,
		);
		this.routeIds.add(route.id);
		return route;
	}

	private resolveRouteDefinition<E extends string = string>(
		definition: DynamicRouteDefinition<E>,
	): DynamicRouteDefinition<E> {
		if (typeof definition === "string") {
			return joinPathSegments<E>(this.prefix, definition);
		}

		return {
			method: definition.method,
			path: joinPathSegments(this.prefix, definition.path),
		};
	}
}
