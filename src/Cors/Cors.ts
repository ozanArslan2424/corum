import type { CRequest } from "@/CRequest/CRequest";
import type { CResponse } from "@/CResponse/CResponse";
import type { CorsOptions } from "@/Cors/types/CorsOptions";
import { boolToString } from "@/utils/boolToString";
import { isSomeArray } from "@/utils/isSomeArray";
import { _corsStore } from "@/index";

/** Simple cors helper object to set cors headers */

export class Cors {
	constructor(readonly opts: CorsOptions | undefined) {
		if (opts === undefined) {
			_corsStore.set(null);
		} else {
			_corsStore.set(this);
		}
	}

	private readonly originKey = "Access-Control-Allow-Origin";
	private readonly methodsKey = "Access-Control-Allow-Methods";
	private readonly headersKey = "Access-Control-Allow-Headers";
	private readonly credentialsKey = "Access-Control-Allow-Credentials";

	getCorsHeaders(req: CRequest, res: CResponse) {
		const reqOrigin = req.headers.get("origin") ?? "";

		const { allowedOrigins, allowedMethods, allowedHeaders, credentials } =
			this.opts ?? {};

		if (isSomeArray(allowedOrigins) && allowedOrigins.includes(reqOrigin)) {
			res.headers.set(this.originKey, reqOrigin);
		}

		if (isSomeArray(allowedMethods)) {
			res.headers.set(this.methodsKey, allowedMethods.join(", "));
		}

		if (isSomeArray(allowedHeaders)) {
			res.headers.set(this.headersKey, allowedHeaders.join(", "));
		}

		res.headers.set(this.credentialsKey, boolToString(credentials));

		return res.headers;
	}

	apply(req: CRequest, res: CResponse): void {
		const headers = this.getCorsHeaders(req, res);
		res.headers.innerCombine(headers);
	}
}
