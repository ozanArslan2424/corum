import type { MiddlewareUseOn } from "./MiddlewareUseOn";
import type { MiddlewareHandler } from "@/types/MiddlewareHandler";

export type MiddlewareOptions = {
	useOn: MiddlewareUseOn;
	handler: MiddlewareHandler;
};
