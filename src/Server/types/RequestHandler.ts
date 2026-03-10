import type { CRequest } from "@/CRequest/CRequest";
import type { CResponse } from "@/CResponse/CResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type RequestHandler<R = unknown> = Func<
	[CRequest],
	MaybePromise<CResponse<R>>
>;
