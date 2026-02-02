import type { __Coreum_Context } from "@/lib/Context/__Coreum_Context";

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

export const Context = __Coreum_Context;
export type Context<
	D = void,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = __Coreum_Context<D, R, B, S, P>;
