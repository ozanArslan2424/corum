import type { CRequest } from "@/CRequest/CRequest";
import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import { MiddlewareRegistry } from "@/Router/registries/MiddlewareRegistry";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import { LazyMap } from "@/utils/LazyMap";
import type { Func } from "@/utils/types/Func";
import { internFunc } from "@/utils/internFunc";
import { strRemoveWhitespace } from "@/utils/strRemoveWhitespace";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";
import type { Middleware } from "@/Middleware/Middleware";
import type { RouteInterface } from "@/Route/RouteInterface";
import { objGetKeys } from "@/utils/objGetKeys";
import { BranchAdapter } from "@/Router/adapters/BranchAdapter";

export class Router {
	constructor(private adapter: RouterAdapterInterface = new BranchAdapter()) {}

	private middlewareRegistry = new MiddlewareRegistry();
	private cache = new WeakMap<CRequest, RouterReturnData>();
	private internFuncMap = new LazyMap<string, Func>();

	addMiddleware(middleware: Middleware): void {
		this.middlewareRegistry.add(middleware);
	}

	findMiddleware(id: string): {
		inbound: MiddlewareHandler;
		outbound: MiddlewareHandler;
	} {
		return this.middlewareRegistry.find(id);
	}

	addRoute(route: RouteInterface<string, any, any, any, any>): void {
		const data: RouterRouteData = {
			id: route.id,
			endpoint: route.endpoint,
			method: route.method,
			handler: route.handler,
			variant: route.variant,
		};
		if (route.model) {
			const modelData: RouterRouteData["model"] = {};
			for (const key of objGetKeys<keyof RouteModel>(route.model)) {
				if (key === "response") continue;
				const schema = route.model[key];
				if (!schema) continue;
				modelData[key] = internFunc(
					this.internFuncMap,
					schema["~standard"].validate,
					"model",
					strRemoveWhitespace(JSON.stringify(schema)),
				);
			}
			data.model = modelData;
		}

		this.adapter.add(data);
	}

	findRoute(req: CRequest): RouterReturnData | null {
		const match = this.cache.get(req) ?? this.adapter.find(req);
		if (!match) return null;
		this.cache.set(req, match);
		return match;
	}

	getRouteList(): Array<RouterRouteData> {
		return this.adapter.list();
	}
}
