import type { __Coreum_Context } from "@/lib/Context/__Coreum_Context";

export type __Coreum_RouteCallback<
	D = any,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = (context: __Coreum_Context<D, R, B, S, P>) => Promise<R> | R;
