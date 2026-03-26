import type { CorsOptions } from "@/XCors/types/CorsOptions";
import { boolToString } from "@/utils/boolToString";
import { isSomeArray } from "@/utils/isSomeArray";
import { MiddlewareVariant } from "@/Middleware/enums/MiddlewareVariant";
import type { MiddlewareHandler } from "@/Middleware/types/MiddlewareHandler";
import { MiddlewareAbstract } from "@/Middleware/MiddlewareAbstract";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";
import type { MiddlewareUseOn } from "@/Middleware/types/MiddlewareUseOn";
import { $routerStore } from "@/index";

/** Simple cors helper object to set cors headers */

export class XCors extends MiddlewareAbstract {
	constructor(private readonly opts: CorsOptions | undefined) {
		super();
		$routerStore.get().addMiddleware(this);
	}

	private readonly originKey = CommonHeaders.AccessControlAllowOrigin;
	private readonly methodsKey = CommonHeaders.AccessControlAllowMethods;
	private readonly headersKey = CommonHeaders.AccessControlAllowHeaders;
	private readonly credentialsKey = CommonHeaders.AccessControlAllowCredentials;
	private readonly exposedHeadersKey = CommonHeaders.AccessControlExposeHeaders;

	useOn: MiddlewareUseOn = "*";
	variant: MiddlewareVariant = MiddlewareVariant.outbound;
	handler: MiddlewareHandler = async (c) => {
		console.log(c.headers.toJSON());
		const reqOrigin = c.headers.get("origin") ?? "";
		const {
			allowedOrigins,
			allowedMethods,
			allowedHeaders,
			exposedHeaders,
			credentials,
		} = this.opts ?? {};

		if (isSomeArray(allowedOrigins) && allowedOrigins.includes(reqOrigin)) {
			c.res.headers.set(this.originKey, reqOrigin);
		}

		if (isSomeArray(allowedMethods)) {
			c.res.headers.append(this.methodsKey, allowedMethods);
		}

		if (isSomeArray(allowedHeaders)) {
			c.res.headers.append(this.headersKey, allowedHeaders);
		}

		if (isSomeArray(exposedHeaders)) {
			c.res.headers.append(this.exposedHeadersKey, exposedHeaders);
		}

		c.res.headers.set(this.credentialsKey, boolToString(credentials));
	};
}
