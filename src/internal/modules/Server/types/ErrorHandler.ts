import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";
import type { MaybePromise } from "@/internal/utils/MaybePromise";

export type ErrorHandler<R = unknown> = (
	err: Error,
) => MaybePromise<HttpResponseInterface<R>>;
