import { HttpRequest } from "@/internal/modules/HttpRequest/HttpRequest";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import { RequestParser } from "@/internal/modules/Parser/RequestParser";
import { RouteContextAbstract } from "@/internal/modules/RouteContext/RouteContextAbstract";
import type { RouteContextInterface } from "@/internal/modules/RouteContext/RouteContextInterface";
import type { RouteSchemas } from "@/internal/modules/Parser/types/RouteSchemas";

/**
 * The context object used in Route "callback" parameter.
 * Takes 5 generics:
 * D = Data passed through a {@link Middleware}
 * R = The return type
 * B = Request body
 * S = Request URL search params
 * P = Request URL params
 * The types are resolved using Route "schemas" parameter except D
 * which you may want to pass if you have middleware data.
 *
 * Contains:
 * req = {@link Request} instance
 * url = Request URL
 * body = Async function to get the parsed Request body
 * search = Parsed Request URL search params
 * params = Parsed Request URL params
 * status = To set the Response status
 * statusText = To set the Response statusText
 * headers = To set the Response {@link Headers}
 * cookies = To set the Response {@link Cookies}
 * */

export class RouteContext<R = unknown, B = unknown, S = unknown, P = unknown>
	extends RouteContextAbstract<R, B, S, P>
	implements RouteContextInterface<R, B, S, P>
{
	static async makeFromRequest<
		Path extends string = string,
		R = unknown,
		B = unknown,
		S = unknown,
		P = unknown,
	>(
		request: HttpRequestInterface,
		path: Path,
		schemas?: RouteSchemas<R, B, S, P>,
	): Promise<RouteContextInterface<R, B, S, P>> {
		const requestParser = new RequestParser();

		const req = new HttpRequest(request);
		const url = new URL(req.url);
		const headers = req.headers;
		const cookies = req.cookies;
		const body = await requestParser.getBody(req, schemas?.body);
		const search = requestParser.getSearch(url, schemas?.search);
		const params = requestParser.getParams(path, url, schemas?.params);

		return new RouteContext(req, url, headers, cookies, body, search, params);
	}
}
