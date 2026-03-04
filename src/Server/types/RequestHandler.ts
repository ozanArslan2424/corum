import type { HttpRequest } from "@/Request/HttpRequest";
import type { HttpResponse } from "@/Response/HttpResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type RequestHandler<R = unknown> = Func<
	[HttpRequest],
	MaybePromise<HttpResponse<R>>
>;
