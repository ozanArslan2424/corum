import type { Cookies } from "@/Cookies/Cookies";
import type { CHeaders } from "@/CHeaders/CHeaders";
import type { CRequest } from "@/CRequest/CRequest";
import { CResponse } from "@/CResponse/CResponse";
import { Parser } from "@/Model/Parser";
import type { ContextDataInterface } from "@/types.d.ts";
import type { RouterModelData } from "@/Router/types/RouterModelData";

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
	constructor(
		req: CRequest,
		body: B,
		search: S,
		params: P,
		res?: CResponse<R>,
	) {
		this.req = req;
		this.url = req.urlObject;
		this.headers = req.headers;
		this.cookies = req.cookies;
		this.body = body;
		this.search = search;
		this.params = params;
		this.res = res ?? new CResponse<R>();
	}

	req: CRequest;
	url: URL;
	headers: CHeaders;
	cookies: Cookies;
	body: B;
	search: S;
	params: P;
	res: CResponse<R>;
	data: ContextDataInterface = {};

	static makeFromRequest(req: CRequest): Context {
		return new Context(req, {}, {}, {});
	}

	static async appendParsedData<
		B = unknown,
		S = unknown,
		P = unknown,
		R = unknown,
	>(
		ctx: Context<B, S, P, R>,
		req: CRequest,
		params: Record<string, string>,
		search: Record<string, string>,
		model?: RouterModelData<B, S, P>,
	) {
		ctx.body = await Parser.parseBody(req, model?.body);
		ctx.params = await Parser.parseUrlData(params, model?.params);
		ctx.search = await Parser.parseUrlData(search, model?.search);
	}
}
