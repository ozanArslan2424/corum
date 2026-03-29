import { $routerStore } from "@/index";
import { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import { MiddlewareAbstract } from "@/Middleware/MiddlewareAbstract";
import type { MiddlewareOptions } from "@/Middleware/types/MiddlewareOptions";

/**
 * Simple Middleware registration class.
 * variant = "inbound" runs before route handlers
 * variant = "outbound" runs after route handlers
 * Both variants manipulate the context and can return CResponse or void.
 */

export class Middleware extends MiddlewareAbstract {
	constructor(opts: MiddlewareOptions) {
		super();
		this.variant = opts.variant ?? MiddlewareVariant.inbound;
		if (opts.useOn) {
			this.useOn = opts.useOn;
		}
		if (opts.handler) {
			this.handler = opts.handler;
		}
		$routerStore.get().addMiddleware(this);
	}

	readonly variant: MiddlewareVariant;
	readonly useOn: Required<MiddlewareOptions>["useOn"] = "*";
	readonly handler: Required<MiddlewareOptions>["handler"] = () => {};
}
