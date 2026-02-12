import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";
import type { MaybePromise } from "@/internal/utils/MaybePromise";

export type RequestHandler<R = unknown> = (
	req: HttpRequestInterface,
) => MaybePromise<HttpResponseInterface<R>>;
