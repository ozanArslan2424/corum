import type { Context } from "@/Context/Context";
import type { CResponse } from "@/CResponse/CResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type MiddlewareHandler = Func<
	[context: Context],
	MaybePromise<void | CResponse>
>;
