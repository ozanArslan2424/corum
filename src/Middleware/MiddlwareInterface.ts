import type { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";
import type { MiddlewareUseOn } from "@/Middleware/types/MiddlewareUseOn";

export interface MiddlewareInterface {
	useOn: MiddlewareUseOn;
	variant: MiddlewareVariant;
	handler: MiddlewareHandler;
}
