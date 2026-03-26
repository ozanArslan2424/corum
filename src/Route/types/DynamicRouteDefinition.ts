import type { Method } from "@/CRequest/enums/Method";

export type DynamicRouteDefinition<E extends string = string> =
	| { method: Method; path: E }
	| E;
