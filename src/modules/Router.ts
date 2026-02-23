import { Middleware, Route, StaticRoute } from "@/exports";
import { Context } from "@/modules/Context";
import type { ControllerAbstract } from "@/modules/ControllerAbstract";
import type { HttpRequest } from "@/modules/HttpRequest";
import { HttpResponse } from "@/modules/HttpResponse";
import { MiddlewareRegistry } from "@/modules/MiddlewareRegistry";
import { ModelRegistry } from "@/modules/ModelRegistry";
import { RouteRegistry } from "@/modules/RouteRegistry";
import type { AnyRoute } from "@/types/AnyRoute";
import type { AnyRouteModel } from "@/types/AnyRouteModel";
import type { MiddlewareHandler } from "@/types/MiddlewareHandler";
import type { ModelRegistryData } from "@/types/ModelRegistryData";
import type { RouteId } from "@/types/RouteId";
import type { RouteRegistryData } from "@/types/RouteRegistryData";

export class Router {
	private cache = new WeakMap<HttpRequest, () => Promise<HttpResponse>>();

	getRouteHandler(req: HttpRequest): () => Promise<HttpResponse> {
		const cached = this.cache.get(req);
		if (cached) {
			return cached;
		}

		const route = this.findRoute(req);
		const ctx = Context.makeFromRequest(req);
		const middleware = this.findMiddleware(route.id);
		const model = this.findModel(route.id);

		const handler = async () => {
			await middleware(ctx);
			await Context.appendParsedData(ctx, req, route.endpoint, model);
			const result = await route.handler(ctx);
			return result instanceof HttpResponse
				? result
				: new HttpResponse(result, {
						cookies: ctx.res.cookies,
						headers: ctx.res.headers,
						status: ctx.res.status,
						statusText: ctx.res.statusText,
					});
		};

		this.cache.set(req, handler);
		return handler;
	}

	globalPrefix: string = "";

	setGlobalPrefix(value: string) {
		this.globalPrefix = value;
	}

	routeRegistryInstance: RouteRegistry | undefined;
	get routeRegistry(): RouteRegistry {
		if (!this.routeRegistryInstance) {
			this.routeRegistryInstance = new RouteRegistry();
		}
		return this.routeRegistryInstance;
	}
	getRouteList(): string {
		return this.routeRegistry.list();
	}
	addRoute(r: AnyRoute): void {
		this.routeRegistry.add(r);
		if (r.model) {
			this.modelRegistry.add(r.id, r.model);
		}
	}
	addController(c: ControllerAbstract) {
		for (const r of Object.values(c)) {
			if (r instanceof Route || r instanceof StaticRoute) {
				this.addRoute(r);
			}
		}
	}
	findRoute(req: HttpRequest): RouteRegistryData {
		return this.routeRegistry.find(req);
	}

	middlewareRegistryInstance: MiddlewareRegistry | undefined;
	get middlewareRegistry(): MiddlewareRegistry {
		if (!this.middlewareRegistryInstance) {
			this.middlewareRegistryInstance = new MiddlewareRegistry();
		}
		return this.middlewareRegistryInstance;
	}
	addMiddleware(m: Middleware): void {
		return this.middlewareRegistry.add(m);
	}
	findMiddleware(routeId: RouteId): MiddlewareHandler {
		if (!this.middlewareRegistryInstance) {
			return () => {};
		}
		return this.middlewareRegistry.find(routeId);
	}

	modelRegistryInstance: ModelRegistry | undefined;
	get modelRegistry(): ModelRegistry {
		if (!this.modelRegistryInstance) {
			this.modelRegistryInstance = new ModelRegistry();
		}
		return this.modelRegistryInstance;
	}
	addModel(routeId: RouteId, model: AnyRouteModel): void {
		return this.modelRegistry.add(routeId, model);
	}
	findModel(routeId: RouteId): ModelRegistryData | undefined {
		if (!this.modelRegistryInstance) {
			return undefined;
		}
		return this.modelRegistry.find(routeId);
	}
}
