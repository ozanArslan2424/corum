import type { MiddlewareVariant } from "@/Middleware/MiddlewareVariant";
import type { MiddlewareHandler } from "@/Middleware/MiddlewareHandler";
import type { MiddlewareUseOn } from "@/Middleware/MiddlewareUseOn";

export type MiddlewareOptions = {
	variant?: MiddlewareVariant;
	useOn?: MiddlewareUseOn;
	handler: MiddlewareHandler;
};
