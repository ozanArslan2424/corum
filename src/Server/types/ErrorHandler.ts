import type { HttpResponse } from "@/Response/HttpResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type ErrorHandler<R = unknown> = Func<
	[Error],
	MaybePromise<HttpResponse<R>>
>;
