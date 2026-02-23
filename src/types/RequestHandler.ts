import type { HttpRequest } from "@/modules/HttpRequest";
import type { HttpResponse } from "@/modules/HttpResponse";
import type { MaybePromise } from "@/types/MaybePromise";

export type RequestHandler<R = unknown> = (
	req: HttpRequest,
) => MaybePromise<HttpResponse<R>>;
