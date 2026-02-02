import { isSomeArray } from "@/utils/isSomeArray";
import { __Coreum_Headers } from "../Headers/__Coreum_Headers";
import type { __Coreum_Request } from "../Request/__Coreum_Request";
import type { __Coreum_Response } from "../Response/__Coreum_Response";
import type { __Coreum_CorsConfig } from "./__Coreum_CorsConfig";
import { toStringBool } from "@/utils/toStringBool";

export class __Coreum_Cors {
	constructor(readonly config: __Coreum_CorsConfig) {}

	private readonly originKey = "Access-Control-Allow-Origin";
	private readonly methodsKey = "Access-Control-Allow-Methods";
	private readonly headersKey = "Access-Control-Allow-Headers";
	private readonly credentialsKey = "Access-Control-Allow-Credentials";

	public getCorsHeaders(req: __Coreum_Request, res: __Coreum_Response) {
		const reqOrigin = req.headers.get("origin") ?? "";
		const headers = new __Coreum_Headers(res.headers);

		const { allowedOrigins, allowedMethods, allowedHeaders, credentials } = this.config;

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
}
