import type { Method } from "@/enums/Method";

export type RouteDefinition<Path extends string = string> =
	| { method: Method; path: Path }
	| Path;
