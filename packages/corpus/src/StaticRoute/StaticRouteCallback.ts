import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { Context } from "@/Context/Context";
import type { Res } from "@/Res/Res";

type R = Res | string;

export type StaticRouteCallback<B = unknown, S = unknown, P = unknown> = Func<
	[context: Context<B, S, P, R>, content: string],
	MaybePromise<R>
>;
