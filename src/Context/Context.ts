import type { Cookies } from "@/Cookies/Cookies";
import type { CHeaders } from "@/CHeaders/CHeaders";
import type { CRequest } from "@/CRequest/CRequest";
import { CResponse } from "@/CResponse/CResponse";
import { XParser } from "@/Model/XParser";
import type { ContextDataInterface } from "@/types.d.ts";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";

/**
 * The context object used in Route "callback" parameter.
 * Takes 4 generics:
 * R = The return type
 * B = Request body
 * S = Request URL search params
 * P = Request URL params
 * The types are resolved using Route "model" parameter.
 *
 * Contains:
 * req = {@link HTTPRequest} instance
 * url = Request {@link URL} object
 * headers = Request {@link HTTPHeaders}
 * cookies = Request {@link Cookies}
 * body = Parsed Request body
 * search = Parsed Request URL search params
 * params = Parsed Request URL params
 * res = To set the {@link HTTPResponse} data
 * */

export class Context<B = unknown, S = unknown, P = unknown, R = unknown> {
	constructor(req: CRequest, res?: CResponse<R>) {
		this.req = req;
		this.url = req.urlObject;
		this.headers = req.headers;
		this.cookies = req.cookies;
		this.res = res ?? new CResponse<R>();
	}

	req: CRequest;
	url: URL;
	headers: CHeaders;
	cookies: Cookies;
	body: B = {} as B;
	search: S = {} as S;
	params: P = {} as P;
	res: CResponse<R>;
	data: ContextDataInterface = {};

	static async appendParsedData<
		B = unknown,
		S = unknown,
		P = unknown,
		R = unknown,
	>(ctx: Context<B, S, P, R>, req: CRequest, data: RouterReturnData<B, S, P>) {
		ctx.body = await XParser.parseBody(req, data.route.model?.body);
		ctx.params = await XParser.parseUrlData(
			data.params,
			data.route.model?.params,
		);
		ctx.search = await XParser.parseUrlData(
			data.search,
			data.route.model?.search,
		);
	}
}
