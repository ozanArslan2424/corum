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

import type { Cookies } from "@/modules/Cookies";
import type { HttpHeaders } from "@/modules/HttpHeaders";
import type { HttpRequest } from "@/modules/HttpRequest";
import { HttpResponse } from "@/modules/HttpResponse";
import { Parser } from "@/modules/Parser";
import type { ContextDataInterface } from "@/types.d.ts";
import type { ModelRegistryData } from "@/types/ModelRegistryData";

export class Context<R = unknown, B = unknown, S = unknown, P = unknown> {
	constructor(
		readonly req: HttpRequest,
		body: B,
		search: S,
		params: P,
		res?: HttpResponse<R>,
	) {
		this.url = req.urlObject;
		this.headers = req.headers;
		this.cookies = req.cookies;
		this.body = body;
		this.search = search;
		this.params = params;
		this.res = res ?? new HttpResponse<R>();
	}

	url: URL;
	headers: HttpHeaders;
	cookies: Cookies;
	body: B;
	search: S;
	params: P;
	res: HttpResponse<R>;
	data: ContextDataInterface = {};

	static makeFromRequest(req: HttpRequest): Context {
		return new Context(req, {}, {}, {});
	}

	static async appendParsedData<
		Path extends string = string,
		R = unknown,
		B = unknown,
		S = unknown,
		P = unknown,
	>(
		ctx: Context<R, B, S, P>,
		req: HttpRequest,
		endpoint: Path,
		model?: ModelRegistryData<R, B, S, P>,
	) {
		ctx.body = await Parser.getBody(req, model?.body);
		ctx.search = await Parser.getSearch(ctx.url, model?.search);
		ctx.params = await Parser.getParams(endpoint, ctx.url, model?.params);
	}
}
