import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import type { CookiesInterface } from "@/internal/modules/Cookies/CookiesInterface";
import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";

export interface RouteContextInterface<B = unknown, S = unknown, P = unknown> {
	readonly req: HttpRequestInterface;
	readonly url: URL;
	readonly headers: HttpHeadersInterface;
	readonly cookies: CookiesInterface;
	readonly body: B;
	readonly search: S;
	readonly params: P;
	res: HttpResponseInterface;
	data: Record<string, unknown>;
}
