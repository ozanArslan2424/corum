import { strSplit } from "corpus-utils/strSplit";

import { CHeaders } from "@/CHeaders/CHeaders";
import type { CHeadersInit } from "@/CHeaders/CHeadersInit";
import { CommonHeaders } from "@/CommonHeaders/CommonHeaders";
import { Cookies } from "@/Cookies/Cookies";
import { Method } from "@/Method/Method";
import type { ReqInfo } from "@/Req/ReqInfo";
import type { ReqInit } from "@/Req/ReqInit";

/** Req includes a cookie jar, better headers, and some utilities. */

export class Req extends Request {
	constructor(
		readonly info: ReqInfo,
		readonly init?: ReqInit,
	) {
		super(info, init);
	}

	get isPreflight(): boolean {
		return (
			this.method === Method.OPTIONS && this.headers.has(CommonHeaders.AccessControlRequestMethod)
		);
	}

	get isWebsocket(): boolean {
		const isUpgrade = this.headers.get(CommonHeaders.Connection)?.toLowerCase() === "upgrade";
		const isWebsocket = this.headers.get(CommonHeaders.Upgrade)?.toLowerCase() === "websocket";
		return isUpgrade && isWebsocket;
	}

	get urlObject(): URL {
		let urlObject: URL;

		switch (true) {
			case this.info instanceof URL:
				urlObject = this.info;
				break;

			case this.info instanceof Req:
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

	override get headers(): CHeaders {
		let init: CHeadersInit | undefined;

		if (this.info instanceof Request) {
			init = this.info.headers;
		}

		if (this.init?.headers) {
			init = this.init.headers;
		}

		return new CHeaders(init);
	}

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
}
