import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type StaticRouteHandler<B = unknown, S = unknown, P = unknown> = Func<
	[Context<B, S, P, string>, string],
	MaybePromise<string>
>;

//
// (
// 	context: Context<B, S, P, string>,
// 	content: string,
// ) => MaybePromise<string>;
