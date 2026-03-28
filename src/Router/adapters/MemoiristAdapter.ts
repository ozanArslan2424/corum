import Memoirist from "memoirist";
import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { CRequest } from "@/CRequest/CRequest";

/**
 * Router adapter wrapping the "memoirist" package.
 *
 * @see {@link https://github.com/SaltyAom/memoirist memoirist}
 * @author {@link https://github.com/SaltyAom SaltyAom}
 *
 * @remarks
 * This is an optional dependency — install `memoirist` to use this adapter.
 * No code was copied; this is purely a thin adapter layer over the package's public API.
 *
 * MemoiristAdapter benchmark results: (300 routes)
 * Setup Time:    1.06
 * Lookups:       30,000
 * Hit rate:      100.00%
 * Accuracy:      100.00%
 * Avg:           0.0001ms
 * Min:           0.0000ms
 * Max:           0.1792ms
 * P95:           0.0000ms
 * P99:           0.0004ms
 * RPS:           17088409
 */
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
