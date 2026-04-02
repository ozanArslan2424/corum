import { $routerStore } from "@/index";
import { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import type { MiddlewareInterface } from "@/Middleware/MiddlwareInterface";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";
import type { MiddlewareUseOn } from "@/Middleware/types/MiddlewareUseOn";

export abstract class MiddlewareAbstract implements MiddlewareInterface {
	variant: MiddlewareVariant = MiddlewareVariant.inbound;

	abstract useOn: MiddlewareUseOn;

	abstract handler: MiddlewareHandler;

	register(): void {
		$routerStore.get().addMiddleware(this);
	}
}
