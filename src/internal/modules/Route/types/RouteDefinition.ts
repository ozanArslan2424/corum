import type { Method } from "@/internal/enums/Method";

export type RouteDefinition<Path extends string = string> =
	| { method: Method; path: Path }
	| Path;
