import type { Controller } from "@/Controller/Controller";
import type { BaseRouteAbstract } from "@/BaseRoute/BaseRouteAbstract";

export type MiddlewareUseOn =
	| Array<BaseRouteAbstract<any, any, any, any, string> | Controller | string>
	| BaseRouteAbstract<any, any, any, any, string>
	| Controller
	| "*";
