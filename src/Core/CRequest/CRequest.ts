import { Method } from "@/Core/CRequest/Method";
import { CommonHeaders } from "@/Core/CHeaders/CommonHeaders";
import { Cookies } from "@/Core/Cookies/Cookies";
import { CHeaders } from "@/Core/CHeaders/CHeaders";
import type { CRequestInfo } from "@/Core/CRequest/CRequestInfo";
import type { CRequestInit } from "@/Core/CRequest/CRequestInit";
import { strSplit } from "@/Utils/strSplit";
import { Func } from "@/Utils/Func";
import type { CHeadersInit } from "@/Core/CHeaders/CHeadersInit";

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
	}

	readonly urlObject: URL;
	readonly cookies: Cookies;
	override headers: CHeaders;

	get isPreflight(): boolean {
		return (
			this.method === Method.OPTIONS &&
			this.headers.has(CommonHeaders.AccessControlRequestMethod)
		);
	}

	get isWebsocket(): boolean {
		const isUpgrade =
			this.headers.get(CommonHeaders.Connection)?.toLowerCase() === "upgrade";
		const isWebsocket =
			this.headers.get(CommonHeaders.Upgrade)?.toLowerCase() === "websocket";
		return isUpgrade && isWebsocket;
	}

	private resolveUrlObject = Func.time("CRequest.resolveUrlObject", (): URL => {
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
	});

	private resolveHeaders = Func.time(
		"CRequest.resolveHeaders",
		(): CHeaders => {
			let init: CHeadersInit | undefined;
			if (this.info instanceof Request) {
				init = this.info.headers;
			}
			if (this.init?.headers) {
				init = this.init.headers;
			}
			return new CHeaders(init);
		},
	);

	/** Gets cookie header and collects cookies for the jar */
	private resolveCookies = Func.time("CRequest.resolveCookies", (): Cookies => {
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
	});
}

// import { Method } from "@/Core/CRequest/Method";
// import { CommonHeaders } from "@/Core/CHeaders/CommonHeaders";
// import { Cookies } from "@/Core/Cookies/Cookies";
// import { CHeaders } from "@/Core/CHeaders/CHeaders";
// import type { CRequestInfo } from "@/Core/CRequest/CRequestInfo";
// import type { CRequestInit } from "@/Core/CRequest/CRequestInit";
// import { strSplit } from "@/Utils/strSplit";
// import { Func } from "@/Utils/Func";
// import type { CHeadersInit } from "@/Core/CHeaders/CHeadersInit";
// import { log } from "@/Utils/log";
//
// /** CRequest includes a cookie jar, better headers, and some utilities. */
//
// export class CRequest extends Request {
// 	constructor(
// 		readonly info: CRequestInfo,
// 		readonly init?: CRequestInit,
// 	) {
// 		super(info, init);
// 	}
//
// 	get isPreflight(): boolean {
// 		return (
// 			this.method === Method.OPTIONS &&
// 			this.headers.has(CommonHeaders.AccessControlRequestMethod)
// 		);
// 	}
//
// 	get isWebsocket(): boolean {
// 		const isUpgrade =
// 			this.headers.get(CommonHeaders.Connection)?.toLowerCase() === "upgrade";
// 		const isWebsocket =
// 			this.headers.get(CommonHeaders.Upgrade)?.toLowerCase() === "websocket";
// 		return isUpgrade && isWebsocket;
// 	}
//
// 	get urlObject(): URL {
// 		return Func.timeReturn("CRequest.resolveUrlObject", (): URL => {
// 			let urlObject: URL;
//
// 			switch (true) {
// 				case this.info instanceof URL:
// 					urlObject = this.info;
// 					break;
//
// 				case this.info instanceof CRequest:
// 					urlObject = this.info.urlObject;
// 					break;
//
// 				case this.info instanceof Request:
// 					urlObject = new URL(this.info.url);
// 					break;
//
// 				default: // string
// 					urlObject = new URL(this.info);
// 					break;
// 			}
//
// 			if (!urlObject.pathname) {
// 				urlObject.pathname += "/";
// 			}
//
// 			return urlObject;
// 		});
// 	}
//
// 	override get headers(): CHeaders {
// 		return Func.timeReturn("CRequest.resolveHeaders", (): CHeaders => {
// 			let init: CHeadersInit | undefined;
//
// 			if (this.info instanceof Request) {
// 				init = this.info.headers;
// 			}
//
// 			if (this.init?.headers) {
// 				init = this.init.headers;
// 			}
//
// 			return new CHeaders(init);
// 		});
// 	}
//
// 	get cookies(): Cookies {
// 		return Func.timeReturn("CRequest.resolveCookies", (): Cookies => {
// 			const jar = new Cookies();
//
// 			const cookieHeader = this.headers.get(CommonHeaders.Cookie);
//
// 			if (cookieHeader) {
// 				const pairs = strSplit(";", cookieHeader);
// 				log.log("Cookies from headers", pairs);
//
// 				for (const pair of pairs) {
// 					const [name, value] = strSplit("=", pair);
// 					if (!name || !value) continue;
// 					jar.set({ name, value });
// 				}
// 			}
//
// 			return jar;
// 		});
// 	}
// }
