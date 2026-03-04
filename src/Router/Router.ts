import { Context } from "@/Context/Context";
import { ControllerAbstract } from "@/Controller/ControllerAbstract";
import type { HttpRequest } from "@/Request/HttpRequest";
import { HttpResponse } from "@/Response/HttpResponse";
import type { AnyRoute } from "@/Route/types/AnyRoute";
import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import type { RouterMiddlewareData } from "@/Router/types/RouterMiddlewareData";
import type { RouterModelData } from "@/Router/types/RouterModelData";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import { HttpError } from "@/Error/HttpError";
import { isRegexMatch } from "@/utils/isRegexMatch";
import { strIsEqual } from "@/utils/strIsEqual";
import { strRemoveWhitespace } from "@/utils/strRemoveWhitespace";
import type { Func } from "@/utils/types/Func";
import { Route } from "@/Route/Route";
import type { Middleware } from "@/Middleware/Middleware";

export class Router {
	// endpoint -> RouteRegistryData
	private _routes: Map<string, RouterRouteData> | undefined;
	// RouteId | "*" -> RouterMiddlewareData
	private _middlewares: Map<string, RouterMiddlewareData> | undefined;
	// RouteId -> ModelRegistryData
	private _models: Map<RouteId, RouterModelData> | undefined;

	private internFuncMap = new Map<string, Func>();

	private cache = new WeakMap<HttpRequest, Func<[], Promise<HttpResponse>>>();

	get routes(): Map<string, RouterRouteData> {
		if (!this._routes) {
			this._routes = new Map<string, RouterRouteData>();
		}
		return this._routes;
	}

	get models(): Map<RouteId, RouterModelData> {
		if (!this._models) {
			this._models = new Map<RouteId, RouterModelData>();
		}
		return this._models;
	}

	get middlewares(): Map<string, RouterMiddlewareData> {
		if (!this._middlewares) {
			this._middlewares = new Map<string, RouterMiddlewareData>();
		}
		return this._middlewares;
	}

	globalPrefix: string = "";

	setGlobalPrefix(value: string) {
		this.globalPrefix = value;
	}

	getRouteHandler(req: HttpRequest): Func<[], Promise<HttpResponse>> {
		const cached = this.cache.get(req);
		if (cached) {
			return cached;
		}

		const route = this.findRoute(req);
		const ctx = Context.makeFromRequest(req);
		const middleware = this.findRouterMiddlewareData(route.id);
		const model = this.findModel(route.id);

		const handler = async () => {
			await middleware?.(ctx);
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

	getRouteList(): Array<[string, string]> {
		return Array.from(this.routes.values()).map((r) => [r.method, r.endpoint]);
	}

	addRoute(r: AnyRoute): void {
		const handler = this.intern(r.handler, "route", r.id);

		this.checkPossibleCollision(r);
		this.routes.set(r.endpoint, {
			id: r.id,
			endpoint: r.endpoint,
			method: r.method,
			handler,
			pattern: r.pattern,
		});
	}

	addMiddleware(m: Middleware): void {
		const useOn = m.useOn;
		const handler = this.intern(m.handler, "middleware", m.handler.toString());

		if (useOn === "*") {
			this.middlewares.set(
				"*",
				this.compile([this.middlewares.get("*"), handler]),
			);
			return;
		}

		for (const target of Array.isArray(useOn) ? useOn : [useOn]) {
			const routeIds =
				target instanceof Route
					? [target.id]
					: target instanceof ControllerAbstract
						? Array.from(target.routeIds)
						: [];

			for (const routeId of routeIds) {
				this.middlewares.set(
					routeId,
					this.compile([
						this.middlewares.get("*"),
						this.middlewares.get(routeId),
						handler,
					]),
				);
			}
		}
	}

	addModel(routeId: RouteId, model: AnyRouteModel): void {
		const entry: RouterModelData = {};
		for (const k of Object.keys(model)) {
			const key = k as keyof RouterModelData;
			const schema = model[key];
			if (!schema) continue;
			const handler = schema["~standard"].validate;
			entry[key] = this.intern(
				handler,
				"model",
				strRemoveWhitespace(JSON.stringify(schema)),
			);
		}
		this.models.set(routeId, entry);
	}

	findRouterMiddlewareData(routeId: RouteId): RouterMiddlewareData | undefined {
		return this.middlewares.get(routeId);
	}

	findModel(routeId: RouteId): RouterModelData | undefined {
		return this.models.get(routeId);
	}

	findRoute(req: HttpRequest): RouterRouteData {
		const reqPath = req.urlObject.pathname;
		const reqMethod = req.method;

		let route: RouterRouteData | null = null;

		for (const [endpoint, data] of this.routes.entries()) {
			// Check for pattern match for parameterized routes
			if (endpoint.includes(":")) {
				// Pattern match first
				if (isRegexMatch(reqPath, data.pattern)) {
					route = data;
					break;
				}

				// If pattern doesn't match check for missing last part param
				if (
					this.hasLastPartParam(endpoint) &&
					strIsEqual(
						endpoint.split("/").slice(0, -1).join("/"),
						reqPath,
						"lower",
					)
				) {
					route = data;
					break;
				}

				// Check for simple pathname match for static routes
			} else if (strIsEqual(endpoint, reqPath)) {
				// Found exact match
				route = data;
				break;
			}
		}

		if (route === null) {
			throw HttpError.notFound();
		}

		// The endpoint exists but the method is not allowed
		if (!strIsEqual(reqMethod, route.method, "upper")) {
			throw HttpError.methodNotAllowed();
		}

		return route;
	}

	private checkPossibleCollision(r: AnyRoute) {
		const existingById = this.routes.get(r.id);
		if (existingById) {
			console.error(
				`⚠️  Collision: ${r.method} ${r.endpoint} clashes with ${existingById.method} ${existingById.endpoint}`,
			);
		}

		for (const existing of this.routes.values()) {
			// Different methods can't clash
			if (existing.method !== r.method) continue;

			if (this.hasAnyParam(r.endpoint)) {
				// Has params, pattern shouldn't match existing
				if (isRegexMatch(r.endpoint, existing.pattern)) {
					console.error(
						`⚠️  Collision: ${r.method} ${r.endpoint} clashes with ${existing.method} ${existing.endpoint}`,
					);
				}

				// Param route vs static route with same base
				if (!this.hasAnyParam(existing.endpoint)) {
					if (
						strIsEqual(
							this.removeLastParam(r.endpoint),
							existing.endpoint,
							"lower",
						)
					) {
						console.error(
							`⚠️  Param route ${r.method} ${r.endpoint} may conflict with static ${existing.method} ${existing.endpoint}`,
						);
					}
				}
			} else {
				// No params, endpoint string shouldn't already exist
				if (strIsEqual(r.endpoint, existing.endpoint, "lower")) {
					console.error(
						`⚠️  Collision: ${r.method} ${r.endpoint} already exists`,
					);
				}

				// No params but existing has last part param
				if (this.hasLastPartParam(existing.endpoint)) {
					if (
						strIsEqual(
							this.removeLastParam(r.endpoint),
							this.removeLastParam(existing.endpoint),
							"lower",
						)
					) {
						console.error(
							`⚠️  Static route ${r.method} ${r.endpoint} may be shadowed by param route ${existing.method} ${existing.endpoint}`,
						);
					}
				}
			}
		}
	}

	private hasLastPartParam(endpoint: string): boolean {
		if (!this.hasAnyParam(endpoint)) return false;
		const parts = endpoint.split("/");
		return parts[parts.length - 1]?.startsWith(":") ?? false;
	}

	private removeLastParam(endpoint: string): string {
		return endpoint.split("/").slice(0, -1).join("/");
	}

	private hasAnyParam(endpoint: string): boolean {
		return endpoint.includes(":");
	}

	private compile<F extends Func>(
		fns: (F | undefined)[],
	): Func<Parameters<F>, Promise<void>> {
		return async (...args: Parameters<F>) => {
			for (const fn of fns) {
				if (!fn) continue;
				await fn(...args);
			}
		};
	}

	private intern<T extends Func>(value: T, ...namespace: string[]): T {
		const key = namespace.join("::");
		const existing = this.internFuncMap.get(key);
		if (existing) return existing as T;
		this.internFuncMap.set(key, value);
		return value;
	}
}
