import type { MiddlewareHandler } from "@/Middleware";
import type { RouterModelData } from "@/Router/types/RouterModelData";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export type RouterReturnData = {
	route: RouterRouteData;
	model: RouterModelData | undefined;
	middleware: MiddlewareHandler | undefined;
	params: Record<string, string>;
	search: Record<string, string>;
};
