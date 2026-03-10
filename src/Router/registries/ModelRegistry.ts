import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import { Route } from "@/Route";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouterModelData } from "@/Router/types/RouterModelData";
import { LazyMap } from "@/Store/LazyMap";
import { strRemoveWhitespace } from "@/utils/strRemoveWhitespace";
import type { Func } from "@/utils/types/Func";

export class ModelRegistry {
	// RouteId -> ModelRegistryData
	private map = new LazyMap<RouteId, RouterModelData>();

	add(method: string, endpoint: string, model: AnyRouteModel): void {
		const entry = ModelRegistry.toRouterModelData(model);
		this.map.set(Route.makeRouteId(method, endpoint), entry);
	}

	find(routeId: RouteId): RouterModelData | undefined {
		return this.map.get(routeId);
	}

	// STATIC
	private static internFuncMap = new LazyMap<string, Func>();

	static toRouterModelData(model: AnyRouteModel): RouterModelData {
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
		return entry;
	}

	private static intern<T extends Func>(value: T, ...namespace: string[]): T {
		const key = namespace.join("::");
		const existing = this.internFuncMap.get(key);
		if (existing) return existing as T;
		this.internFuncMap.set(key, value);
		return value;
	}
}
