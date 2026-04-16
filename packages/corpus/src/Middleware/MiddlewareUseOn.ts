import type { Controller } from "@/Controller/Controller";
import type { RouteAbstract } from "@/Route/RouteAbstract";

export type MiddlewareUseOn =
	| Array<RouteAbstract<any, any, any, any, string> | Controller | string>
	| RouteAbstract<any, any, any, any, string>
	| Controller
	| "*";
