import { MiddlewareVariant } from "@/Middleware/MiddlewareVariant";
import { MiddlewareAbstract } from "@/Middleware/MiddlewareAbstract";
import type { MiddlewareOptions } from "@/Middleware/MiddlewareOptions";

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
		this.handler = opts.handler;
		if (opts.useOn) {
			this.useOn = opts.useOn;
		}
		this.register();
	}

	readonly useOn: Required<MiddlewareOptions>["useOn"] = "*";
	readonly handler: Required<MiddlewareOptions>["handler"];
}
