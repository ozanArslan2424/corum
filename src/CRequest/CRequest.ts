import { Method } from "@/CRequest/enums/Method";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";
import { Cookies } from "@/Cookies/Cookies";
import { CHeaders } from "@/CHeaders/CHeaders";
import type { CRequestInfo } from "@/CRequest/types/CRequestInfo";
import type { CRequestInit } from "@/CRequest/types/CRequestInit";
import { strSplit } from "@/utils/strSplit";

/** CRequest includes a cookie jar, better headers, and some utilities. */

export class CRequest extends Request {
	constructor(
		readonly info: CRequestInfo,
		readonly init?: CRequestInit,
	) {
		super(info, init);
		this.urlObject = this.resolveUrlObject();
		this.headers = this.resolveHeaders();
		this.cookies = this.resolveCookies();
		this.isPreflight = this.resolveIsPreflight();
	}

	readonly urlObject: URL;
	readonly isPreflight: boolean;
	readonly cookies: Cookies;
	override headers: CHeaders;

	private resolveUrlObject(): URL {
		let urlObject: URL;

		switch (true) {
			case this.info instanceof URL:
				urlObject = this.info;
				break;

			case this.info instanceof CRequest:
				urlObject = this.info.urlObject;
				break;

			case this.info instanceof Request:
				urlObject = new URL(this.info.url);
				break;

			default: // string
				urlObject = new URL(this.info);
				break;
		}

		if (!urlObject.pathname) {
			urlObject.pathname += "/";
		}

		return urlObject;
	}

	private resolveHeaders(): CHeaders {
		if (this.init?.headers !== undefined) {
			return new CHeaders(this.init.headers);
		}
		if (this.info instanceof Request || this.info instanceof CRequest) {
			return new CHeaders(this.info.headers);
		}
		return new CHeaders();
	}

	/** Gets cookie header and collects cookies for the jar */
	private resolveCookies(): Cookies {
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

	private resolveIsPreflight() {
		const accessControlRequestMethodHeader = this.headers.has(
			CommonHeaders.AccessControlRequestMethod,
		);
		return this.method === Method.OPTIONS && accessControlRequestMethodHeader;
	}
}
