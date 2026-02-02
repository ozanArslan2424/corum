import { __Coreum_Error } from "@/lib/Error/__Coreum_Error";
import { __Coreum_Parse } from "./__Coreum_Parse";
import { type __Coreum_SchemaType } from "./__Coreum_SchemaType";
import type { __Coreum_Request } from "@/lib/Request/__Coreum_Request";
import type { __Coreum_RouteSchemas } from "../Route/__Coreum_RouteSchemas";
import { __Coreum_Status } from "@/lib/Status/__Coreum_Status";

export class __Coreum_Parser<R = unknown, B = unknown, S = unknown, P = unknown> {
	constructor(private readonly schemas?: __Coreum_RouteSchemas<R, B, S, P>) {}

	private appendEntry(
		data: Record<string, unknown>,
		key: string,
		value: string | boolean | number,
	) {
		const existing = data[key];
		if (existing !== undefined) {
			data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
		} else {
			data[key] = value;
		}
	}

	private getProcessedValue(value: string) {
		let processedValue: string | boolean | number = value;

		if (/^-?\d+(\.\d+)?$/.test(value)) {
			processedValue = Number(value);
		} else if (value.toLowerCase() === "true" || value.toLowerCase() === "false") {
			processedValue = value.toLowerCase() === "true";
		}

		return processedValue;
	}

	parseRequestSearch(searchParams: URLSearchParams): S {
		const data: Record<string, unknown> = {};

		for (const [key, value] of searchParams.entries()) {
			const processedValue = this.getProcessedValue(value);
			this.appendEntry(data, key, processedValue);
		}

		return this.parseWithSchema<S>("search", data);
	}

	parseRequestParams(requestPath: string, definedPath: string): P {
		const definedPathSegments = definedPath.split("/");
		const requestPathSegments = requestPath.split("/");

		const paramsObject: Record<string, unknown> = {};

		for (const [index, definedPathSegment] of definedPathSegments.entries()) {
			const requestPathSegment = requestPathSegments[index];

			if (definedPathSegment.startsWith(":") && requestPathSegment !== undefined) {
				const paramName = definedPathSegment.slice(1);
				const paramValue = requestPathSegment;
				paramsObject[paramName] = this.getProcessedValue(paramValue);
			}
		}

		return this.parseWithSchema<P>("params", paramsObject);
	}

	async parseRequestBody(req: __Coreum_Request): Promise<B> {
		const empty = {} as B;

		try {
			switch (req.contentType) {
				case "json":
					return this.parseWithSchema<B>("body", await this.getJsonBody(req));
				case "form-urlencoded":
					return this.parseWithSchema<B>("body", await this.getFormUrlEncodedBody(req));
				case "form-data":
					return this.parseWithSchema<B>("body", await this.getFormDataBody(req));
				case "text":
					return this.parseWithSchema<B>("body", await this.getTextBody(req));
				case "xml":
				case "binary":
				case "pdf":
				case "image":
				case "audio":
				case "video":
					throw new __Coreum_Error(
						"unprocessable.contentType",
						__Coreum_Status.UNPROCESSABLE_ENTITY,
					);
				case "unknown":
					throw new __Coreum_Error("unprocessable.body", __Coreum_Status.UNPROCESSABLE_ENTITY);
				case "no-body-allowed":
				default:
					return empty;
			}
		} catch (err) {
			if (err instanceof SyntaxError) return empty;
			throw err;
		}
	}

	private parseWithSchema<T>(type: "body" | "params" | "search", data: unknown): T {
		const schema = this.schemas?.[type] as __Coreum_SchemaType<T> | undefined;
		if (schema) {
			return __Coreum_Parse<T>(data, schema, `unprocessable.${type}`);
		}
		return data as T;
	}

	private async getJsonBody(req: __Coreum_Request): Promise<unknown> {
		return await req.json();
	}

	private async getFormUrlEncodedBody(req: __Coreum_Request): Promise<unknown> {
		const text = await req.text();
		if (!text || text.trim().length === 0) {
			throw new SyntaxError("Body is empty");
		}

		const params = new URLSearchParams(text);
		const body: Record<string, any> = {};

		for (const [key, value] of params.entries()) {
			this.appendEntry(body, key, value);
		}

		return body;
	}

	private async getFormDataBody(req: __Coreum_Request): Promise<unknown> {
		const formData = await req.formData();
		const entries = formData.entries() as IterableIterator<[string, FormDataEntryValue]>;

		const body: Record<string, unknown> = {};

		for (const [key, value] of entries) {
			if (value instanceof File) {
				body[key] = value;
			} else {
				this.appendEntry(body, key, value);
			}
		}

		return body;
	}

	private async getTextBody(req: __Coreum_Request): Promise<unknown> {
		const contentLength = req.headers.get("content-length");
		const length = contentLength ? parseInt(contentLength) : 0;

		// 1MB threshold
		if (length > 0 && length < 1024 * 1024) {
			const text = await req.text();
			return text;
		}

		const buffer = await req.arrayBuffer();
		const contentType = req.headers.get("content-type") || "";
		const match = contentType.match(/charset=([^;]+)/i);
		const charset = match?.[1] ? match[1].trim() : null;

		const decoder = new TextDecoder(charset || "utf-8");
		const text = decoder.decode(buffer);

		return text;
	}
}
