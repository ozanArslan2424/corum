import type { Func } from "corpus-utils/Func";
import { log } from "corpus-utils/internalLog";
import { internFunc } from "corpus-utils/internFunc";
import { objGetKeys } from "corpus-utils/objGetKeys";
import { strRemoveWhitespace } from "corpus-utils/strRemoveWhitespace";

import { $registry } from "@/index";
import { BranchAdapter } from "@/Registry/BranchAdapter";
import type { RouterAdapterInterface } from "@/Registry/RouterAdapterInterface";
import type { RouterData } from "@/Registry/RouterData";
import type { RouterReturn } from "@/Registry/RouterReturn";
import type { Req } from "@/Req/Req";
import type { BaseRouteInterface } from "@/BaseRoute/BaseRouteInterface";
import type { RouteModel } from "@/BaseRoute/RouteModel";

export class Router {
	constructor(private adapter: RouterAdapterInterface = new BranchAdapter()) {}

	private cache = new WeakMap<Req, RouterReturn>();
	private funcMap = new Map<string, Func>();

	add(route: BaseRouteInterface<any, any, any, any, string>): void {
		const data = this.routeToRouterData(route);
		if (route.model) {
			if (!data.model) {
				data.model = {};
			}
			// const modelData: RouterData["model"] = {};
			for (const key of objGetKeys<keyof RouteModel>(route.model)) {
				if (key === "response") continue;
				const schema = route.model[key];
				if (!schema) continue;
				data.model[key] = internFunc(
					this.funcMap,
					schema["~standard"].validate,
					"model",
					strRemoveWhitespace(JSON.stringify(schema)),
				);
			}
		}
		this.adapter.add(data);
		$registry.docs.set(route.id, {
			id: route.id,
			endpoint: route.endpoint,
			method: route.method,
			model: route.model,
		});
	}

	find(req: Req): RouterReturn | null {
		const match = this.cache.get(req) ?? this.adapter.find(req);
		if (!match) return null;
		this.cache.set(req, match);
		return match;
	}

	list(): Array<RouterData> {
		const fn = this.adapter.list;
		if (!fn) {
			log.warn("Router adapter does not support list method, returning empty array");
		}
		return fn?.() ?? [];
	}

	private routeToRouterData(route: BaseRouteInterface<any, any, any, any, string>): RouterData {
		return {
			id: route.id,
			endpoint: route.endpoint,
			method: route.method,
			handler: route.handler,
			variant: route.variant,
		};
	}
}
