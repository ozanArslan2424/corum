import { Status } from "@/internal/enums/Status";
import type { CookiesInterface } from "@/internal/modules/Cookies/CookiesInterface";

import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpResponseBody } from "@/internal/modules/HttpResponse/types/HttpResponseBody";
import type { HttpResponseInit } from "@/internal/modules/HttpResponse/types/HttpResponseInit";

export interface HttpResponseInterface<R = unknown> {
	readonly body?: HttpResponseBody<R>;
	readonly init?: HttpResponseInit;
	headers: HttpHeadersInterface;
	status: Status;
	statusText: string;
	cookies: CookiesInterface;
	get response(): Response;
}
