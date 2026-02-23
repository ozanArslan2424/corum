import type { HttpResponse } from "@/modules/HttpResponse";
import type { MaybePromise } from "@/types/MaybePromise";

export type ErrorHandler<R = unknown> = (
	err: Error,
) => MaybePromise<HttpResponse<R>>;
