import type { Middleware } from "@/Middleware";
import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import type { HttpRequest } from "@/Request/HttpRequest";
import type { AnyRoute } from "@/Route/types/AnyRoute";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export interface RouterAdapterInterface {
	find(req: HttpRequest): RouterReturnData | null;
	list(): Array<RouterRouteData>;
	addRoute(data: RouterRouteData): void;
	addModel(route: AnyRoute, model: AnyRouteModel): void;
	addMiddleware(middleware: Middleware): void;
}
