import type { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import type { MiddlewareInterface } from "@/Middleware/MiddlwareInterface";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";
import type { MiddlewareUseOn } from "@/Middleware/types/MiddlewareUseOn";

export abstract class MiddlewareAbstract implements MiddlewareInterface {
	abstract useOn: MiddlewareUseOn;
	abstract variant: MiddlewareVariant;
	abstract handler: MiddlewareHandler;
}
