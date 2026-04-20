import type { CHeaders } from "@/CHeaders/CHeaders";
import type { Cookies } from "@/Cookies/Cookies";
import { Parser } from "@/Parser/Parser";
import type { RouterReturn } from "@/Registry/RouterReturn";
import type { Req } from "@/Req/Req";
import { Res } from "@/Res/Res";
import type { ContextDataInterface } from "@/types.d.ts";

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
	constructor(req: Req, res?: Res<R>) {
		this.req = req;
		this.url = req.urlObject;
		this.headers = req.headers;
		this.cookies = req.cookies;
		this.res = res ?? new Res<R>();
	}

	readonly req: Req;
	url: URL;
	headers: CHeaders;
	cookies: Cookies;
	body: B = {} as B;
	search: S = {} as S;
	params: P = {} as P;
	data: ContextDataInterface = {};
	res: Res<R>;

	static async appendParsedData<B = unknown, S = unknown, P = unknown, R = unknown>(
		ctx: Context<B, S, P, R>,
		req: Req,
		data: RouterReturn,
	) {
		ctx.body = await Parser.parseBody(req, data.route.model?.body);

		ctx.search = await Parser.parseSearchParams(
			req.urlObject.searchParams,
			data.route.model?.search,
		);

		ctx.params = await Parser.parseUrlParams(data.params, data.route.model?.params);
	}
}
