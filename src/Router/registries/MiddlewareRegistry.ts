import { Controller } from "@/Controller/Controller";
import { DynamicRoute } from "@/DynamicRoute/DynamicRoute";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouterMiddlewareData } from "@/Router/types/RouterMiddlewareData";
import { LazyMap } from "@/utils/LazyMap";
import { compile } from "@/utils/compile";
import type { MiddlewareInterface } from "@/Middleware/MiddlwareInterface";
import { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";

export class MiddlewareRegistry {
	// RouteId | "*" -> RouterMiddlewareData
	private middlewares = new LazyMap<string, RouterMiddlewareData>();

	add(middleware: MiddlewareInterface): void {
		const resolved = MiddlewareRegistry.resolveRouteIds(middleware);

		if (resolved.isGlobal) {
			const existing = this.middlewares.get("*") ?? [];
			this.middlewares.set("*", [...existing, middleware]);
			return;
		}

		for (const routeId of resolved.routeIds) {
			const existing = this.middlewares.get(routeId) ?? [];
			this.middlewares.set(routeId, [...existing, middleware]);
		}
	}

	find(routeId: RouteId | "*"): {
		inbound: MiddlewareHandler;
		outbound: MiddlewareHandler;
	} {
		const arr = this.middlewares.get(routeId) ?? [];
		const inbound = arr
			.filter((m) => m.variant === MiddlewareVariant.inbound)
			.map((m) => m.handler);
		const outbound = arr
			.filter((m) => m.variant === MiddlewareVariant.outbound)
			.map((m) => m.handler);
		return {
			inbound: compile(inbound),
			outbound: compile(outbound),
		};
	}

	// STATIC

	/** Returns a discriminated union — isGlobal true means useOn was "*" */
	static resolveRouteIds(
		m: MiddlewareInterface,
	): { isGlobal: true } | { isGlobal: false; routeIds: RouteId[] } {
		if (m.useOn === "*") return { isGlobal: true };

		const targets = Array.isArray(m.useOn) ? m.useOn : [m.useOn];
		const routeIds: RouteId[] = [];

		for (const target of targets) {
			if (target instanceof DynamicRoute) {
				routeIds.push(target.id);
			} else if (target instanceof Controller) {
				routeIds.push(...target.routeIds);
			}
		}

		return { isGlobal: false, routeIds };
	}
}
