import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type RouteHandler<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> = Func<[Context<B, S, P, R>], MaybePromise<R>>;
