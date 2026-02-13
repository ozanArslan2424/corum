import type { HttpHeadersInterface } from "@/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpRequestInterface } from "@/modules/HttpRequest/HttpRequestInterface";
import type { RouteContextInterface } from "@/modules/RouteContext/RouteContextInterface";
import type { CookiesInterface } from "@/modules/Cookies/CookiesInterface";
import { HttpResponse } from "@/modules/HttpResponse/HttpResponse";

export class RouteContextAbstract<
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> implements RouteContextInterface<R, B, S, P> {
	constructor(
		readonly req: HttpRequestInterface,
		readonly url: URL,
		readonly headers: HttpHeadersInterface,
		readonly cookies: CookiesInterface,
		readonly body: B,
		readonly search: S,
		readonly params: P,
	) {}

	res = new HttpResponse<R>();
	data: Record<string, unknown> = {};
}
