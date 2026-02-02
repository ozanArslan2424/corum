import type { __Coreum_Context } from "../Context/__Coreum_Context";
import type { __Coreum_Response } from "../Response/__Coreum_Response";

/**
 *  This takes in a regular request which is converted to Core.Req for types,
 * the context part is for the middlewares
 */

export type __Coreum_RouteHandler<
	D = any,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = (req: Request, context?: __Coreum_Context<D, R, B, S, P>) => Promise<__Coreum_Response>;
