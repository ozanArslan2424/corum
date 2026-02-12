import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import type { RouteContextInterface } from "@/internal/modules/RouteContext/RouteContextInterface";
import type { CookiesInterface } from "@/internal/modules/Cookies/CookiesInterface";
import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";

export class RouteContextAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
> implements RouteContextInterface<B, S, P> {
	constructor(
		readonly req: HttpRequestInterface,
		readonly url: URL,
		readonly headers: HttpHeadersInterface,
		readonly cookies: CookiesInterface,
		readonly body: B,
		readonly search: S,
		readonly params: P,
		res: HttpResponseInterface,
	) {
		this.res = res;
	}

	res: HttpResponseInterface;
	data: Record<string, unknown> = {};
}
