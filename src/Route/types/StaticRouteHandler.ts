import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type StaticRouteHandler<
	B = unknown,
	S = unknown,
	P = unknown,
	R = string,
> = Func<[context: Context<B, S, P, R>, content: string], MaybePromise<R>>;
