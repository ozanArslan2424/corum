import { __Coreum_Parser } from "@/lib/parse/__Coreum_Parser";
import { __Coreum_Cookies } from "@/lib/Cookies/__Coreum_Cookies";
import { __Coreum_Headers } from "@/lib/Headers/__Coreum_Headers";
import { type __Coreum_SchemaType } from "../parse/__Coreum_SchemaType";
import { __Coreum_Request } from "@/lib/Request/__Coreum_Request";
import { type __Coreum_RouteSchemas } from "../Route/__Coreum_RouteSchemas";
import { __Coreum_Status } from "@/lib/Status/__Coreum_Status";

export class __Coreum_Context<D = void, R = unknown, B = unknown, S = unknown, P = unknown> {
	req: __Coreum_Request;
	status: __Coreum_Status;
	statusText: string;
	headers: __Coreum_Headers;
	cookies: __Coreum_Cookies;
	url: URL;
	body: () => Promise<B>;
	search: S;
	params: P;

	constructor(
		private readonly request: Request,
		public readonly path: string,
		private readonly schemas?: __Coreum_RouteSchemas<R, B, S, P>,
		public data?: D,
	) {
		const parser = new __Coreum_Parser(this.schemas);

		this.req = new __Coreum_Request(this.request);

		this.status = __Coreum_Status.OK;

		this.statusText = "OK";

		this.url = new URL(this.req.url);

		this.body = () => parser.parseRequestBody(this.req);

		this.params = parser.parseRequestParams(this.url.pathname, this.path);

		this.search = parser.parseRequestSearch(this.url.searchParams);

		this.headers = new __Coreum_Headers(this.req.headers);

		this.cookies = new __Coreum_Cookies();
	}
}
