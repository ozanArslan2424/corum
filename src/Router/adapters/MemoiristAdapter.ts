import Memoirist from "memoirist";
import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { CRequest } from "@/CRequest/CRequest";

/** Router Adapter for the "memoirist" package. */

export class MemoiristAdapter implements RouterAdapterInterface {
	private router = new Memoirist<RouterRouteData>();

	find(req: CRequest): RouterReturnData | null {
		const method = req.method;
		const pathname = req.urlObject.pathname;
		const searchParams = req.urlObject.searchParams;

		const result = this.router.find(method, pathname);
		if (!result) return null;
		return {
			route: result.store,
			params: result.params,
			search: Object.fromEntries(searchParams),
		};
	}

	list(): Array<RouterRouteData> {
		return this.router.history.map((v) => v[2]);
	}

	add(data: RouterRouteData): void {
		this.router.add(data.method, data.endpoint, data);
	}
}
