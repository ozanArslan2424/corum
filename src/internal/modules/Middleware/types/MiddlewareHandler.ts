import type { RouteContextInterface } from "@/internal/modules/RouteContext/RouteContextInterface";
import type { MaybePromise } from "@/internal/utils/MaybePromise";

export type MiddlewareHandler = (
	context: RouteContextInterface,
) => MaybePromise<RouteContextInterface | void>;
