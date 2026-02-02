import { __Coreum_CommonHeaders } from "@/lib/CommonHeaders/__Coreum_CommonHeaders";
import { __Coreum_Cookies } from "../Cookies/__Coreum_Cookies";
import { __Coreum_Headers } from "../Headers/__Coreum_Headers";
import { __Coreum_Method } from "@/lib/Method/__Coreum_Method";
import type { __Coreum_RequestInfo } from "./__Coreum_RequestInfo";
import type { __Coreum_RequestInit } from "./__Coreum_RequestInit";
import { getValues } from "@/utils/getValues";
import { textSplit } from "@/utils/textSplit";
import { textIsFoundIn } from "@/utils/textIsFoundIn";

export class __Coreum_Request extends Request {
	readonly cookies = new __Coreum_Cookies();

	constructor(
		url: __Coreum_RequestInfo,
		readonly init?: __Coreum_RequestInit,
	) {
		const headers = new __Coreum_Headers(init?.headers);
		delete init?.headers;
		super(url, { ...init, headers });
		this.parseCookies();
	}

	get isMethodNotAllowed() {
		return !getValues(__Coreum_Method).includes(this.method.toUpperCase() as __Coreum_Method);
	}

	get isPreflight() {
		const accessControlRequestMethodHeader =
			this.headers.get(__Coreum_CommonHeaders.AccessControlRequestMethod) ||
			this.headers.get(__Coreum_CommonHeaders.AccessControlRequestMethod.toLowerCase());
		return this.method === __Coreum_Method.OPTIONS && accessControlRequestMethodHeader;
	}

	get contentType() {
		const contentTypeHeader =
			this.headers.get(__Coreum_CommonHeaders.ContentType) ||
			this.headers.get(__Coreum_CommonHeaders.ContentType.toLowerCase()) ||
			"";

		if (
			!textIsFoundIn(this.method.toUpperCase(), [
				__Coreum_Method.POST,
				__Coreum_Method.PUT,
				__Coreum_Method.PATCH,
				__Coreum_Method.DELETE,
			])
		) {
			return "no-body-allowed";
		}

		if (contentTypeHeader.includes("application/json")) {
			return "json";
		} else if (contentTypeHeader.includes("application/x-www-form-urlencoded")) {
			return "form-urlencoded";
		} else if (contentTypeHeader.includes("multipart/form-data")) {
			return "form-data";
		} else if (contentTypeHeader.includes("text/plain")) {
			return "text";
		} else if (contentTypeHeader.includes("application/xml")) {
			return "xml";
		} else if (contentTypeHeader.includes("text/xml")) {
			return "xml";
		} else if (contentTypeHeader.includes("application/octet-stream")) {
			return "binary";
		} else if (contentTypeHeader.includes("application/pdf")) {
			return "pdf";
		} else if (contentTypeHeader.includes("image/")) {
			return "image";
		} else if (contentTypeHeader.includes("audio/")) {
			return "audio";
		} else if (contentTypeHeader.includes("video/")) {
			return "video";
		}

		return "unknown";
	}

	/**
	 * Gets cookie header and collects cookies for the jar
	 * */
	private parseCookies() {
		const cookieHeader = this.headers.get("cookie");
		if (cookieHeader) {
			const pairs = textSplit(";", cookieHeader);
			for (const pair of pairs) {
				const [name, value] = textSplit("=", pair);
				if (!name || !value) continue;
				this.cookies.set({ name, value });
			}
		}
	}
}
