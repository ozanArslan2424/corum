import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { Context } from "@/Context/Context";

export type BaseRouteHandler<B = unknown, S = unknown, P = unknown, R = unknown> = Func<
	[context: Context<B, S, P, R>],
	MaybePromise<R>
>;
