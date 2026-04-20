import { compile } from "corpus-utils/compile";

import { Controller } from "@/Controller/Controller";
import type { MiddlewareHandler } from "@/Middleware/MiddlewareHandler";
import type { MiddlewareUseOn } from "@/Middleware/MiddlewareUseOn";
import { MiddlewareVariant } from "@/Middleware/MiddlewareVariant";
import type { MiddlewareInterface } from "@/Middleware/MiddlwareInterface";
import type { MiddlewareStoreReturn } from "@/Registry/MiddlewareStoreReturn";
import { BaseRouteAbstract } from "@/BaseRoute/BaseRouteAbstract";

export class MiddlewareStore {
	private inboundMap = new Map<string, Array<MiddlewareHandler>>();
	private outboundMap = new Map<string, Array<MiddlewareHandler>>();

	add(middleware: MiddlewareInterface): void {
		const resolved = MiddlewareStore.resolveRouteIds(middleware.useOn, middleware.variant);
		const map = resolved.variant === MiddlewareVariant.inbound ? this.inboundMap : this.outboundMap;

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

	find(routeId: string): MiddlewareStoreReturn {
		return {
			inbound: compile(this.inboundMap.get(routeId) ?? []),
			outbound: compile(this.outboundMap.get(routeId) ?? []),
		};
	}

	// STATIC

	/** Returns a discriminated union — isGlobal true means useOn was "*" */
	static resolveRouteIds(
		useOn: MiddlewareUseOn,
		variant: MiddlewareVariant,
	):
		| { isGlobal: true; variant: MiddlewareVariant }
		| { isGlobal: false; routeIds: string[]; variant: MiddlewareVariant } {
		if (useOn === "*") return { isGlobal: true, variant };

		const targets = Array.isArray(useOn) ? useOn : [useOn];
		const routeIds: string[] = [];

		for (const target of targets) {
			if (target instanceof BaseRouteAbstract) {
				routeIds.push(target.id);
			} else if (target instanceof Controller) {
				routeIds.push(...target.routeIds);
			} else {
				routeIds.push(target);
			}
		}

		return { isGlobal: false, routeIds, variant };
	}
}
