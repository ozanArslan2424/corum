/** HttpRequest includes a cookie jar, better headers, and some utilities. */

import { Method } from "@/enums/Method";
import { CommonHeaders } from "@/enums/CommonHeaders";
import { Cookies } from "@/modules/Cookies";
import { HttpHeaders } from "@/modules/HttpHeaders";
import type { HttpRequestInfo } from "@/types/HttpRequestInfo";
import type { HttpRequestInit } from "@/types/HttpRequestInit";
import { strSplit } from "@/utils/strSplit";

export class HttpRequest extends Request {
	constructor(
		readonly input: HttpRequestInfo,
		readonly init?: HttpRequestInit,
	) {
		super(input, init);
	}

	get urlObject(): URL {
		return new URL(this.url);
	}

	override get headers(): HttpHeaders {
		if (this.input instanceof Request) {
			return new HttpHeaders(this.input.headers);
		} else if (this.init?.headers !== undefined) {
			return new HttpHeaders(this.init.headers);
		} else {
			return new HttpHeaders();
		}
	}

	/** Gets cookie header and collects cookies for the jar */
	get cookies(): Cookies {
		const jar = new Cookies();

		const cookieHeader = this.headers.get(CommonHeaders.Cookie);

		if (cookieHeader) {
			const pairs = strSplit(";", cookieHeader);

			for (const pair of pairs) {
				const [name, value] = strSplit("=", pair);
				if (!name || !value) continue;
				jar.set({ name, value });
			}
		}

		return jar;
	}

	get isPreflight(): boolean {
		const accessControlRequestMethodHeader = this.headers.has(
			CommonHeaders.AccessControlRequestMethod,
		);
		return this.method === Method.OPTIONS && accessControlRequestMethodHeader;
	}
}
