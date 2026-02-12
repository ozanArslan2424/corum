import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import type { CookiesInterface } from "@/internal/modules/Cookies/CookiesInterface";
import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";
import type { Type } from "arktype";

export interface RouteContextInterface<
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> {
	readonly req: HttpRequestInterface;
	readonly url: URL;
	readonly headers: HttpHeadersInterface;
	readonly cookies: CookiesInterface;
	readonly body: Type<B>["inferOut"];
	readonly search: Type<S>["inferOut"];
	readonly params: Type<P>["inferOut"];
	res: HttpResponseInterface<Type<R>["inferOut"]>;
	data: Record<string, unknown>;
}
