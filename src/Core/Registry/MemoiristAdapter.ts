import Memoirist from "memoirist";
import type { RouterAdapterInterface } from "@/Core/Registry/RouterAdapterInterface";
import type { RouterData } from "@/Core/Registry/RouterData";
import type { RouterReturn } from "@/Core/Registry/RouterReturn";
import type { CRequest } from "@/Core/CRequest/CRequest";
import type { Func } from "@/Utils/Func";

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
	__brand: string = "MemoiristAdapter";
	private router = new Memoirist<RouterData>();

	find(req: CRequest): RouterReturn | null {
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

	list: Func<[], Array<RouterData>> | undefined = () => {
		return this.router.history.map((v) => v[2]);
	};

	add(data: RouterData): void {
		this.router.add(data.method, data.endpoint, data);
	}
}
