import { isJSONSerializable } from "@/utils/isJSONSerializable";
import { __Coreum_Headers } from "../Headers/__Coreum_Headers";
import { __Coreum_Status } from "../Status/__Coreum_Status";
import type { __Coreum_ResponseBody } from "./__Coreum_ResponseBody";
import type { __Coreum_ResponseInit } from "./__Coreum_ResponseInit";

export class __Coreum_Response<R = unknown> {
	headers: __Coreum_Headers;
	status: __Coreum_Status;
	statusText: string;

	constructor(
		private body?: __Coreum_ResponseBody<R>,
		private readonly init?: __Coreum_ResponseInit,
	) {
		this.headers = new __Coreum_Headers(this.init?.headers);

		const setCookieHeaders = this.init?.cookies?.toSetCookieHeaders();

		if (setCookieHeaders) {
			for (const header of setCookieHeaders) {
				this.headers.append("Set-Cookie", header);
			}
		}

		//
		// if (this.init?.cookies?.entries()) {
		// 	for (const cookieOptions of this.init.cookies.values()) {
		// 		this.headers.append("Set-Cookie", __Coreum_Cookies.createHeader(cookieOptions));
		// 	}
		// }

		if (isJSONSerializable(this.body)) {
			this.body = JSON.stringify(this.body);
			this.headers.set("Content-Type", "application/json");
		}

		this.status = this.init?.status ?? __Coreum_Status.OK;
		this.statusText = this.init?.statusText ?? "OK";
	}

	get response(): Response {
		return new Response(this.body as BodyInit | null, {
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
		});
	}
}
