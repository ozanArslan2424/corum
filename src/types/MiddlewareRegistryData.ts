import type { RouteId } from "./RouteId";
import type { MiddlewareHandler } from "@/types/MiddlewareHandler";

export type MiddlewareRegistryData = {
	handler: MiddlewareHandler;
	order: number;
	routeId: RouteId | "*";
};
