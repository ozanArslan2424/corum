import type { HttpResponse } from "@/Response/HttpResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type AfterResponseHandler =
	| Func<[HttpResponse], MaybePromise<HttpResponse>>
	| undefined;
