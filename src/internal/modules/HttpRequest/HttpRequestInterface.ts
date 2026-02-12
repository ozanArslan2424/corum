import type { CookiesInterface } from "@/internal/modules/Cookies/CookiesInterface";

import type { HttpRequestInfo } from "@/internal/modules/HttpRequest/types/HttpRequestInfo";
import type { HttpRequestInit } from "@/internal/modules/HttpRequest/types/HttpRequestInit";

export interface HttpRequestInterface extends Request {
	readonly input: HttpRequestInfo;
	readonly init?: HttpRequestInit;
	readonly cookies: CookiesInterface;
	get isPreflight(): boolean;
	get normalizedContentType(): string;
}
