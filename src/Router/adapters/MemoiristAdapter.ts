import Memoirist from "memoirist";
import type { RouterAdapterInterface } from "@/Router/RouterAdapterInterface";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";

/** Router Adapter for the "memoirist" package. */

export class MemoiristAdapter implements RouterAdapterInterface {
	private router = new Memoirist<RouterRouteData>();

	add(data: RouterRouteData): void {
		this.router.add(data.method, data.endpoint, data);
	}

	find(
		method: string,
		path: string,
	): { route: RouterRouteData; params?: Record<string, unknown> } | null {
		const result = this.router.find(method, path);
		if (!result) return null;
		return { route: result.store, params: result.params };
	}

	list(): Array<RouterRouteData> {
		return this.router.history.map((v) => v[2]);
	}
}
