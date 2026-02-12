import type { MiddlewareHandler } from "@/internal/modules/Middleware/types/MiddlewareHandler";

export type ControllerOptions<Prefix extends string = string> = {
	prefix?: Prefix;
	beforeEach?: MiddlewareHandler;
};
