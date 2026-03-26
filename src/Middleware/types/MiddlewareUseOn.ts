import type { Controller } from "@/Controller/Controller";
import type { RouteInterface } from "@/index";

export type MiddlewareUseOn =
	| Array<RouteInterface | Controller>
	| RouteInterface
	| Controller
	| "*";
