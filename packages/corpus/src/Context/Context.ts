import type { CHeaders } from "@/CHeaders/CHeaders";
import type { Cookies } from "@/Cookies/Cookies";
import { BodyParser } from "@/Parser/BodyParser";
import { parseSchema } from "@/Parser/parseSchema";
import { SearchParamsParser } from "@/Parser/SearchParamsParser";
import { URLParamsParser } from "@/Parser/URLParamsParser";
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
	res: Res<R>;
	url: URL;
	headers: CHeaders;
	cookies: Cookies;
	body: B = Object.create(null);
	search: S = Object.create(null);
	params: P = Object.create(null);
	data: ContextDataInterface = Object.create(null);

	static async appendParsedData<B = unknown, S = unknown, P = unknown, R = unknown>(
		ctx: Context<B, S, P, R>,
		req: Req,
		data: RouterReturn,
		urlParamsParser: URLParamsParser,
		searchParamsParser: SearchParamsParser,
		bodyParser: BodyParser,
	) {
		const body = await bodyParser.parse(req);

		if (body instanceof ReadableStream) {
			ctx.body = body as B;
		} else {
			ctx.body = await parseSchema("body", body, data.route.model?.body);
		}

		const search = searchParamsParser.toObject(req.urlObject.searchParams);
		ctx.search = await parseSchema("search", search, data.route.model?.search);

		const params = urlParamsParser.toObject(data.params);
		ctx.params = await parseSchema("params", params, data.route.model?.params);
	}
}
