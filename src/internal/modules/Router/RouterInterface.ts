import type { AnyRoute } from "@/internal/modules/Route/types/AnyRoute";

export interface RouterInterface {
	globalPrefix: string;
	addRoute(route: AnyRoute): void;
	findRoute(url: string, method: string): AnyRoute;
	getRoutes(): Array<AnyRoute>;
	getControllerRoutes(controllerId: string): Array<AnyRoute>;
	updateRoute(route: AnyRoute): void;
}
