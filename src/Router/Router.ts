import { Context } from "@/Context/Context";
import type { CRequest } from "@/CRequest/CRequest";
import { CResponse } from "@/CResponse/CResponse";
import type { AnyRoute } from "@/Route/types/AnyRoute";
import { CError } from "@/CError/CError";
import type { Func } from "@/utils/types/Func";
import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import { CorpusAdapter } from "@/Router/adapters/CorpusAdapter";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import type { Middleware } from "@/Middleware";

export class Router {
	constructor(adapter?: RouterAdapterInterface) {
		this._adapter = adapter ?? new CorpusAdapter();
	}

	models: AnyRouteModel[] = [];
	private _adapter: RouterAdapterInterface;
	private cache = new WeakMap<CRequest, Func<[], Promise<CResponse>>>();

	checkPossibleCollision(n: RouterRouteData): boolean {
		if (this._adapter instanceof CorpusAdapter) {
			return this._adapter.checkPossibleCollision(n);
		}
		return false;
	}

	addModel(route: AnyRoute, model: AnyRouteModel): void {
		this.models.push(model);
		this._adapter.addModel(route, model);
	}

	addMiddleware(middleware: Middleware): void {
		this._adapter.addMiddleware(middleware);
	}

	addRoute(r: AnyRoute): void {
		this._adapter.addRoute({
			id: r.id,
			endpoint: r.endpoint,
			method: r.method,
			handler: r.handler,
			pattern: r.pattern,
		});
	}

	findRouteHandler(req: CRequest): Func<[], Promise<CResponse>> {
		const cached = this.cache.get(req);
		if (cached) return cached;

		const match = this._adapter.find(req);
		if (!match) throw CError.notFound();

		const ctx = Context.makeFromRequest(req);

		const handler = async () => {
			await match.middleware?.(ctx);
			await Context.appendParsedData(
				ctx,
				req,
				match.params,
				match.search,
				match.model,
			);
			const res = await match.route.handler(ctx);
			return res instanceof CResponse
				? res
				: new CResponse(res, {
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
}
