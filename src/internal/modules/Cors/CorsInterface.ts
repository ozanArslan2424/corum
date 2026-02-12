import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";
import type { CorsOptions } from "@/internal/modules/Cors/types/CorsOptions";

export interface CorsInterface {
	readonly opts: CorsOptions;
	getCorsHeaders(
		req: HttpRequestInterface,
		res: HttpResponseInterface,
	): HttpHeadersInterface;
	apply(req: HttpRequestInterface, res: HttpResponseInterface): void;
}
