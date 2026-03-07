import { Context } from "@/Context/Context";
import { ControllerAbstract } from "@/Controller/ControllerAbstract";
import type { HttpRequest } from "@/Request/HttpRequest";
import { HttpResponse } from "@/Response/HttpResponse";
import type { AnyRoute } from "@/Route/types/AnyRoute";
import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import type { RouterMiddlewareData } from "@/Router/types/RouterMiddlewareData";
import type { RouterModelData } from "@/Router/types/RouterModelData";
import type { RouteId } from "@/Route/types/RouteId";
import { HttpError } from "@/Error/HttpError";
import { strRemoveWhitespace } from "@/utils/strRemoveWhitespace";
import type { Func } from "@/utils/types/Func";
import { Route } from "@/Route/Route";
import type { Middleware } from "@/Middleware/Middleware";
import type { RouterAdapterInterface } from "@/Router/RouterAdapterInterface";
import { CorpusAdapter } from "@/Router/adapters/CorpusAdapter";
import { LazyMap } from "@/Store/LazyMap";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export class Router {
	constructor(adapter?: RouterAdapterInterface) {
		this._adapter = adapter ?? new CorpusAdapter();
	}

	private _adapter: RouterAdapterInterface;
	private cache = new WeakMap<HttpRequest, Func<[], Promise<HttpResponse>>>();
	private internFuncMap = new LazyMap<string, Func>();
	// RouteId | "*" -> RouterMiddlewareData
	private middlewares = new LazyMap<string, RouterMiddlewareData>();
	// RouteId -> ModelRegistryData
	private models = new LazyMap<RouteId, RouterModelData>();

	checkPossibleCollision(n: RouterRouteData): boolean {
		if (this._adapter instanceof CorpusAdapter) {
			return this._adapter.checkPossibleCollision(n);
		}
		return false;
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

	private findModel(routeId: RouteId): RouterModelData | undefined {
		return this.models.get(routeId);
	}

	addMiddleware(m: Middleware): void {
		const useOn = m.useOn;
		const handler = m.handler;

		if (useOn === "*") {
			const existing = this.middlewares.get("*") ?? [];
			this.middlewares.set("*", [...existing, handler]);
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
				const existing = this.middlewares.get(routeId) ?? [];
				this.middlewares.set(routeId, [...existing, handler]);
			}
		}
	}

	private findMiddleware(routeId: RouteId): Func<[Context]> {
		const globals = this.middlewares.get("*") ?? [];
		const locals = this.middlewares.get(routeId) ?? [];
		return this.compile([...globals, ...locals]);
	}

	addRoute(r: AnyRoute): void {
		this._adapter.add({
			id: r.id,
			endpoint: r.endpoint,
			method: r.method,
			handler: r.handler,
			pattern: r.pattern,
		});
	}

	findRouteHandler(req: HttpRequest): Func<[], Promise<HttpResponse>> {
		const cached = this.cache.get(req);
		if (cached) return cached;

		const match = this._adapter.find(req.method, req.urlObject.pathname);
		if (!match) throw HttpError.notFound();

		const ctx = Context.makeFromRequest(req);
		const mwHandler = this.findMiddleware(match.route.id);
		const model = this.findModel(match.route.id);

		const handler = async () => {
			await mwHandler(ctx);
			await Context.appendParsedData(
				ctx,
				req,
				match.route.endpoint,
				model,
				match.params,
			);
			const res = await match.route.handler(ctx);
			return res instanceof HttpResponse
				? res
				: new HttpResponse(res, {
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
		return this._adapter.list().map((v) => [v.method, v.endpoint]);
	}

	private compile<F extends Func>(
		fns: (F | undefined)[],
	): Func<Parameters<F>, Promise<void>> {
		return async (...args: Parameters<F>) => {
			for (const fn of fns) {
				if (!fn) continue;
				// oxlint-disable-next-line typescript/await-thenable
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
