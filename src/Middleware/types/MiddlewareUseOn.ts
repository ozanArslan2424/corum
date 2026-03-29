import type { Controller } from "@/Controller/Controller";
import type { RouteInterface } from "@/Route/RouteInterface";

export type MiddlewareUseOn =
	| Array<RouteInterface<any, any, any, any, string> | Controller>
	| RouteInterface<any, any, any, any, string>
	| Controller
	| "*";
