import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export type RouterReturnData<B = unknown, S = unknown, P = unknown> = {
	route: RouterRouteData<B, S, P>;
	params: Record<string, string>;
	search: Record<string, string>;
};
