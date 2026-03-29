import { DynamicRoute } from "@/Route/DynamicRoute";
import { StaticRoute } from "@/Route/StaticRoute";
import type { ControllerOptions } from "@/Controller/types/ControllerOptions";
import { joinPathSegments } from "@/utils/joinPathSegments";
import type { Func } from "@/utils/types/Func";
import type { Context } from "@/Context/Context";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import { Method } from "@/CRequest/enums/Method";

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

	routeIds: Set<string> = new Set<string>();
	protected prefix?: string;
	protected beforeEach?: Func<[context: Context], MaybePromise<void>>;

	/**
	 * Registers a dynamic route under this controller. Behaves identically to {@link DynamicRoute}
	 * but automatically prepends the controller prefix and runs `beforeEach` before the handler.
	 */
	protected route<
		B = unknown,
		S = unknown,
		P = unknown,
		R = unknown,
		E extends string = string,
	>(
		...args: ConstructorParameters<typeof DynamicRoute<B, S, P, R, E>>
	): DynamicRoute<B, S, P, R, E> {
		const [def, handler, model] = args;
		const method = typeof def === "string" ? Method.GET : def.method;
		const path = joinPathSegments<E>(
			this.prefix,
			typeof def === "string" ? def : def.path,
		);

		const route = new DynamicRoute(
			{ method, path },
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
		B = unknown,
		S = unknown,
		P = unknown,
		E extends string = string,
	>(
		...args: ConstructorParameters<typeof StaticRoute<B, S, P, E>>
	): StaticRoute<B, S, P, E> {
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
}
