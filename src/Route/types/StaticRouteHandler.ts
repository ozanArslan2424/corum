import type { Context } from "@/Context/Context";
import type { CResponse } from "@/CResponse/CResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type StaticRouteHandler<B = unknown, S = unknown, P = unknown> = Func<
	[context: Context<B, S, P, string | CResponse>, content: string],
	MaybePromise<string | CResponse>
>;
