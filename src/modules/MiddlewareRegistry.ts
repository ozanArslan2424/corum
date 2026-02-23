import { ControllerAbstract } from "@/modules/ControllerAbstract";
import type { Middleware } from "@/modules/Middleware";
import { Route } from "@/modules/Route";
import type { MiddlewareHandler } from "@/types/MiddlewareHandler";
import type { MiddlewareRegistryData } from "@/types/MiddlewareRegistryData";
import type { RouteId } from "@/types/RouteId";

export class MiddlewareRegistry {
	// RouteId -> compiled handler
	readonly compiledCache = new Map<RouteId, MiddlewareHandler>();
	// order -> handler because handlers are repeated by the number of routes
	readonly handlerMap = new Map<number, MiddlewareHandler>();
	// { order, routeId, handler }[]
	readonly data: Array<MiddlewareRegistryData> = [];

	private internMiddlewareHandler(
		order: number,
		fn: MiddlewareHandler,
	): MiddlewareHandler {
		const existing = this.handlerMap.get(order);
		if (existing) return existing;
		this.handlerMap.set(order, fn);
		return fn;
	}

	push(data: MiddlewareRegistryData) {
		if (data.routeId === "*") {
			this.compiledCache.clear();
		} else {
			this.compiledCache.delete(data.routeId);
		}

		// Insert maintaining sort order
		const insertIndex = this.findInsertIndex(data.order);
		this.data.splice(insertIndex, 0, {
			order: data.order,
			routeId: data.routeId,
			handler: this.internMiddlewareHandler(data.order, data.handler),
		});
	}

	private findInsertIndex(order: number): number {
		// Binary search since data is sorted
		let left = 0;
		let right = this.data.length;

		while (left < right) {
			const mid = (left + right) >> 1;
			if (this.data[mid]!.order < order) {
				left = mid + 1;
			} else {
				right = mid;
			}
		}

		return left;
	}

	add(item: Middleware): void {
		const order = this.data.length + 1;
		const handler = item.handler;
		const useOn = item.useOn;

		if (useOn === "*") {
			this.push({ order, handler, routeId: "*" });
			return;
		}

		const targets = Array.isArray(useOn) ? useOn : [useOn];

		for (const target of targets) {
			const routeIds =
				target instanceof Route
					? [target.id]
					: target instanceof ControllerAbstract
						? Array.from(target.routeIds)
						: [];

			for (const routeId of routeIds) {
				this.push({ order, handler, routeId });
			}
		}
	}

	find(routeId: RouteId): MiddlewareHandler {
		const cached = this.compiledCache.get(routeId);
		if (cached) return cached;

		const handlers: MiddlewareHandler[] = [];

		for (const m of this.data) {
			// globals will always run first
			if (m.routeId === "*") {
				handlers.push(m.handler);
			} else if (m.routeId === routeId) {
				handlers.push(m.handler);
			}
		}

		const compiled = this.compile(handlers);
		this.compiledCache.set(routeId, compiled);
		return compiled;
	}

	compile(handlers: MiddlewareHandler[]): MiddlewareHandler {
		return async (ctx) => {
			for (const h of handlers) {
				await h(ctx);
			}
		};
	}
}
