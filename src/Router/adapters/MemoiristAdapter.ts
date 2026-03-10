import Memoirist from "memoirist";
import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import type { RouterModelData } from "@/Router/types/RouterModelData";
import { ModelRegistry } from "@/Router/registries/ModelRegistry";
import type { Middleware, MiddlewareHandler } from "@/Middleware";
import type { RouteId } from "@/Route/types/RouteId";
import { compile } from "@/utils/compile";
import { MiddlewareRegistry } from "@/Router/registries/MiddlewareRegistry";
import type { HttpRequest } from "@/Request/HttpRequest";
import type { AnyRoute } from "@/Route/types/AnyRoute";

type MemoiristData = {
	route: RouterRouteData;
	model?: RouterModelData;
	middlewares?: MiddlewareHandler[];
};

/** Router Adapter for the "memoirist" package. */

export class MemoiristAdapter implements RouterAdapterInterface {
	private router = new Memoirist<MemoiristData>();
	// Pending middleware handlers keyed by RouteId, flushed when the route is registered
	private pendingMiddlewares = new Map<RouteId, MiddlewareHandler[]>();

	find(req: HttpRequest): RouterReturnData | null {
		const method = req.method;
		const pathname = req.urlObject.pathname;
		const searchParams = req.urlObject.searchParams;

		const result = this.router.find(method, pathname);
		if (!result) return null;
		return {
			route: result.store.route,
			model: result.store.model,
			params: result.params,
			search: Object.fromEntries(searchParams),
			middleware: compile(result.store.middlewares ?? []),
		};
	}

	list(): Array<RouterRouteData> {
		return this.router.history.map((v) => v[2].route);
	}

	addRoute(data: RouterRouteData): void {
		this.router.add(data.method, data.endpoint, { route: data });

		// Flush any middleware that was registered before this route existed
		const pending = this.pendingMiddlewares.get(data.id);
		if (pending) {
			const store = this.router.find(data.method, data.endpoint)?.store;
			if (store) store.middlewares = pending;
			this.pendingMiddlewares.delete(data.id);
		}
	}

	addModel(route: AnyRoute, model: AnyRouteModel): void {
		const result = this.router.find(route.method, route.endpoint);
		if (!result) return;
		result.store.model = ModelRegistry.toRouterModelData(model);
	}

	addMiddleware(middleware: Middleware): void {
		const resolved = MiddlewareRegistry.resolveRouteIds(middleware);

		if (resolved.isGlobal) {
			for (const [, , store] of this.router.history) {
				store.middlewares = [...(store.middlewares ?? []), middleware.handler];
			}
			return;
		}

		for (const routeId of resolved.routeIds) {
			const [method, endpoint] = routeId.split(" ", 2) as [string, string];
			const result = this.router.find(method, endpoint);

			if (result) {
				result.store.middlewares = [
					...(result.store.middlewares ?? []),
					middleware.handler,
				];
			} else {
				const pending = this.pendingMiddlewares.get(routeId) ?? [];
				this.pendingMiddlewares.set(routeId, [...pending, middleware.handler]);
			}
		}
	}
}
