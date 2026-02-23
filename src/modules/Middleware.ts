import { getRouterInstance } from "@/index";
import type { MiddlewareHandler } from "@/types/MiddlewareHandler";
import type { MiddlewareOptions } from "@/types/MiddlewareOptions";
import type { MiddlewareUseOn } from "@/types/MiddlewareUseOn";

/**
 * Simple middleware that runs before the Route "callback" parameters.
 * Manipulates context.
 * */

export class Middleware {
	constructor(opts: MiddlewareOptions) {
		this.useOn = opts.useOn;
		this.handler = opts.handler;
		getRouterInstance().addMiddleware(opts);
	}

	useOn: MiddlewareUseOn;
	handler: MiddlewareHandler;
}
