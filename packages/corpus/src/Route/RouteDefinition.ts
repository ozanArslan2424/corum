import type { Method } from "@/Method/Method";

export type RouteDefinition<E extends string = string> = E | { method: Method; path: E };
