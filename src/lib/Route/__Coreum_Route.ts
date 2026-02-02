import { __Coreum_Response } from "../Response/__Coreum_Response";
import type { __Coreum_Method } from "@/lib/Method/__Coreum_Method";
import type { __Coreum_Endpoint } from "./__Coreum_Endpoint";
import type { __Coreum_RouteCallback } from "./__Coreum_RouteCallback";
import type { __Coreum_RouteSchemas } from "./__Coreum_RouteSchemas";
import type { __Coreum_RouteHandler } from "./__Coreum_RouteHandler";
import { __Coreum_Context } from "@/lib/Context/__Coreum_Context";
import { textSplit } from "@/utils/textSplit";

export class __Coreum_Route<
	D = undefined,
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> {
	id: string;
	pattern: RegExp;
	paramNames: string[];

	constructor(
		readonly method: __Coreum_Method,
		readonly path: __Coreum_Endpoint,
		readonly callback: __Coreum_RouteCallback<D, R, B, S, P>,
		readonly schemas?: __Coreum_RouteSchemas<R, B, S, P>,
	) {
		this.id = this.getId(method, path);
		this.pattern = this.getPattern(path);
		this.paramNames = this.getParamNames(path);
	}

	handler: __Coreum_RouteHandler<D, R, B, S, P> = async (req, ctx) => {
		const context = ctx ?? new __Coreum_Context(req, this.path, this.schemas);
		const data = await this.callback(context);
		const res = new __Coreum_Response(data, {
			status: context.status,
			statusText: context.statusText,
			headers: context.headers,
			cookies: context.cookies,
		});
		return res;
	};

	private getPattern(path: string) {
		// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
		const regex = path
			.split("/")
			.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
			.join("/");
		const pattern = new RegExp(`^${regex}$`);
		return pattern;
	}

	private getParamNames(path: string) {
		const paramNames: string[] = [];

		for (const part of textSplit("/", path)) {
			if (part.startsWith(":")) {
				paramNames.push(part.slice(1));
			}
		}

		return paramNames;
	}

	private getId(method: string, path: string) {
		return `[${method}]:[${path}]`;
	}
}
