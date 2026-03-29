import { Controller } from "@/Controller/Controller";
import { DynamicRoute } from "@/Route/DynamicRoute";
import { compile } from "@/utils/compile";
import type { MiddlewareInterface } from "@/Middleware/MiddlwareInterface";
import { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";

export class MiddlewareRegistry {
	private inboundMiddlewares = new Map<string, Array<MiddlewareHandler>>();
	private outboundMiddlewares = new Map<string, Array<MiddlewareHandler>>();

	add(middleware: MiddlewareInterface): void {
		const resolved = MiddlewareRegistry.resolveRouteIds(middleware);
		const map =
			resolved.variant === MiddlewareVariant.inbound
				? this.inboundMiddlewares
				: this.outboundMiddlewares;

		if (resolved.isGlobal) {
			const existing = map.get("*") ?? [];
			map.set("*", [...existing, middleware.handler]);
			return;
		}

		for (const routeId of resolved.routeIds) {
			const existing = map.get(routeId) ?? [];
			map.set(routeId, [...existing, middleware.handler]);
		}
	}

	find(routeId: string): {
		inbound: MiddlewareHandler;
		outbound: MiddlewareHandler;
	} {
		return {
			inbound: compile(this.inboundMiddlewares.get(routeId) ?? []),
			outbound: compile(this.outboundMiddlewares.get(routeId) ?? []),
		};
	}

	// STATIC

	/** Returns a discriminated union — isGlobal true means useOn was "*" */
	static resolveRouteIds(
		m: MiddlewareInterface,
	):
		| { isGlobal: true; variant: MiddlewareVariant }
		| { isGlobal: false; routeIds: string[]; variant: MiddlewareVariant } {
		if (m.useOn === "*") return { isGlobal: true, variant: m.variant };

		const targets = Array.isArray(m.useOn) ? m.useOn : [m.useOn];
		const routeIds: string[] = [];

		for (const target of targets) {
			if (target instanceof DynamicRoute) {
				routeIds.push(target.id);
			} else if (target instanceof Controller) {
				routeIds.push(...target.routeIds);
			}
		}

		return { isGlobal: false, routeIds, variant: m.variant };
	}
}
