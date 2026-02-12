import { Status } from "@/internal/enums/Status";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import { HttpError } from "@/internal/modules/HttpError/HttpError";
import { appendEntry } from "@/internal/utils/appendEntry";
import { getProcessedValue } from "@/internal/utils/getProcessedValue";
import type { Type } from "arktype";

export class RequestParser {
	async getJsonBody(req: HttpRequestInterface): Promise<unknown> {
		return await req.json();
	}

	async getFormUrlEncodedBody(req: HttpRequestInterface): Promise<unknown> {
		const text = await req.text();
		if (!text || text.trim().length === 0) {
			throw new SyntaxError("Body is empty");
		}

		const params = new URLSearchParams(text);
		const body: Record<string, any> = {};

		for (const [key, value] of params.entries()) {
			appendEntry(body, key, value);
		}

		return body;
	}

	async getFormDataBody(req: HttpRequestInterface): Promise<unknown> {
		const formData = await req.formData();
		const entries = formData.entries() as IterableIterator<
			[string, FormDataEntryValue]
		>;

		const body: Record<string, unknown> = {};

		for (const [key, value] of entries) {
			if (value instanceof File) {
				body[key] = value;
			} else {
				appendEntry(body, key, value);
			}
		}

		return body;
	}

	async getTextBody(req: HttpRequestInterface): Promise<unknown> {
		const contentLength = req.headers.get("content-length");
		const length = contentLength ? parseInt(contentLength) : 0;

		// 1MB threshold
		if (length > 0 && length < 1024 * 1024) {
			const text = await req.text();
			return getProcessedValue(text);
		}

		const buffer = await req.arrayBuffer();
		const contentType = req.headers.get("content-type") || "";
		const match = contentType.match(/charset=([^;]+)/i);
		const charset = match?.[1] ? match[1].trim() : null;

		const decoder = new TextDecoder(charset || "utf-8");
		const text = decoder.decode(buffer);

		return getProcessedValue(text);
	}

	async getBody<B = unknown>(
		req: HttpRequestInterface,
		schema?: Type<B>,
	): Promise<Type<B>["inferOut"]> {
		let data;
		const empty = {} as Type<B>["inferOut"];

		try {
			switch (req.normalizedContentType) {
				case "json":
					data = await this.getJsonBody(req);
					break;
				case "form-urlencoded":
					data = await this.getFormUrlEncodedBody(req);
					break;
				case "form-data":
					data = await this.getFormDataBody(req);
					break;
				case "text":
					data = await this.getTextBody(req);
					break;
				case "xml":
				case "binary":
				case "pdf":
				case "image":
				case "audio":
				case "video":
				case "unknown":
					throw new HttpError(
						"unprocessable.contentType",
						Status.UNPROCESSABLE_ENTITY,
					);
				case "no-body-allowed":
				default:
					return empty;
			}

			return this.parse(data, schema);
		} catch (err) {
			if (err instanceof SyntaxError) return empty;
			throw err;
		}
	}

	getParams<P = unknown>(
		path: string,
		url: URL,
		schema?: Type<P>,
	): Type<P>["inferOut"] {
		const data: Record<string, unknown> = {};

		if (!path.includes(":")) {
			throw HttpError.unprocessableEntity(
				"This endpoint doesn't take parameters.",
			);
		}

		const defParts = path.split("/");
		const reqParts = url.pathname.split("/");

		for (const [i, defPart] of defParts.entries()) {
			const reqPart = reqParts[i];

			if (defPart.startsWith(":") && reqPart !== undefined) {
				const key = defPart.slice(1);
				const value = getProcessedValue(decodeURIComponent(reqPart));
				data[key] = value;
			}
		}

		return this.parse(data, schema);
	}

	getSearch<S = unknown>(url: URL, schema?: Type<S>): Type<S>["inferOut"] {
		return this.parse(url, schema);
	}

	parse<T = unknown>(input: unknown, schema?: Type<T>): Type<T>["inferOut"] {
		try {
			if (schema) {
				return schema.assert(input);
			}
			return input as Type<T>["inferOut"];
		} catch (err) {
			throw HttpError.unprocessableEntity((err as Error).message);
		}
	}
}
