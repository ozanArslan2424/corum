import type { Context } from "@/Context";
import { ControllerAbstract } from "@/Controller/ControllerAbstract";
import type { Middleware } from "@/Middleware";
import { Route } from "@/Route";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouterMiddlewareData } from "@/Router/types/RouterMiddlewareData";
import { LazyMap } from "@/Store/LazyMap";
import { compile } from "@/utils/compile";
import type { Func } from "@/utils/types/Func";

export class MiddlewareRegistry {
	// RouteId | "*" -> RouterMiddlewareData
	private middlewares = new LazyMap<string, RouterMiddlewareData>();

	add(m: Middleware): void {
		const resolved = MiddlewareRegistry.resolveRouteIds(m);

		if (resolved.isGlobal) {
			const existing = this.middlewares.get("*") ?? [];
			this.middlewares.set("*", [...existing, m.handler]);
			return;
		}

		for (const routeId of resolved.routeIds) {
			const existing = this.middlewares.get(routeId) ?? [];
			this.middlewares.set(routeId, [...existing, m.handler]);
		}
	}

	find(routeId: RouteId): Func<[Context]> {
		const globals = this.middlewares.get("*") ?? [];
		const locals = this.middlewares.get(routeId) ?? [];
		return compile([...globals, ...locals]);
	}

	// STATIC

	/** Returns a discriminated union — isGlobal true means useOn was "*" */
	static resolveRouteIds(
		m: Middleware,
	): { isGlobal: true } | { isGlobal: false; routeIds: RouteId[] } {
		if (m.useOn === "*") return { isGlobal: true };

		const targets = Array.isArray(m.useOn) ? m.useOn : [m.useOn];
		const routeIds: RouteId[] = [];

		for (const target of targets) {
			if (target instanceof Route) {
				routeIds.push(target.id);
			} else if (target instanceof ControllerAbstract) {
				routeIds.push(...target.routeIds);
			}
		}

		return { isGlobal: false, routeIds };
	}
}
