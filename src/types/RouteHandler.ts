import type { Context } from "@/modules/Context";
import type { MaybePromise } from "@/types/MaybePromise";

export type RouteHandler<R = unknown, B = unknown, S = unknown, P = unknown> = (
	context: Context<R, B, S, P>,
) => MaybePromise<R>;
