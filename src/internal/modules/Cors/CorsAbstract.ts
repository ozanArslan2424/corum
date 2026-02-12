import type { CorsInterface } from "@/internal/modules/Cors/CorsInterface";
import { HttpHeaders } from "@/internal/modules/HttpHeaders/HttpHeaders";
import type { HttpRequest } from "@/internal/modules/HttpRequest/HttpRequest";
import type { HttpResponse } from "@/internal/modules/HttpResponse/HttpResponse";
import type { CorsOptions } from "@/internal/modules/Cors/types/CorsOptions";
import { isSomeArray } from "@/internal/utils/isSomeArray";
import { toStringBool } from "@/internal/utils/toStringBool";

export abstract class CorsAbstract implements CorsInterface {
	constructor(readonly opts: CorsOptions) {}

	private readonly originKey = "Access-Control-Allow-Origin";
	private readonly methodsKey = "Access-Control-Allow-Methods";
	private readonly headersKey = "Access-Control-Allow-Headers";
	private readonly credentialsKey = "Access-Control-Allow-Credentials";

	public getCorsHeaders(req: HttpRequest, res: HttpResponse) {
		const reqOrigin = req.headers.get("origin") ?? "";
		const headers = new HttpHeaders(res.headers);

		const { allowedOrigins, allowedMethods, allowedHeaders, credentials } =
			this.opts;

		if (isSomeArray(allowedOrigins) && allowedOrigins.includes(reqOrigin)) {
			headers.set(this.originKey, reqOrigin);
		}

		if (isSomeArray(allowedMethods)) {
			headers.set(this.methodsKey, allowedMethods.join(", "));
		}

		if (isSomeArray(allowedHeaders)) {
			headers.set(this.headersKey, allowedHeaders.join(", "));
		}

		headers.set(this.credentialsKey, toStringBool(credentials));

		return headers;
	}

	apply(req: HttpRequest, res: HttpResponse): void {
		const headers = this.getCorsHeaders(req, res);
		res.headers.innerCombine(headers);
	}
}
