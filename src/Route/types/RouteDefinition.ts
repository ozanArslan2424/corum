import type { Method } from "@/CRequest/enums/Method";

export type RouteDefinition<Path extends string = string> =
	| { method: Method; path: Path }
	| Path;
