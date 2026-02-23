import type { ControllerAbstract } from "@/modules/ControllerAbstract";
import type { AnyRoute } from "./AnyRoute";

export type MiddlewareUseOn =
	| Array<AnyRoute | ControllerAbstract>
	| AnyRoute
	| ControllerAbstract
	| "*";
