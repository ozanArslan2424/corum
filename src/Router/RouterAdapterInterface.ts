import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export interface RouterAdapterInterface {
	add(data: RouterRouteData): void;
	find(
		method: string,
		path: string,
	): { route: RouterRouteData; params?: Record<string, unknown> } | null;
	list(): Array<RouterRouteData>;
}
