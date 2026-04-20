import { arrIncludes } from "corpus-utils/arrIncludes";
import type { UnknownObject } from "corpus-utils/UnknownObject";

import { CommonHeaders } from "@/CommonHeaders/CommonHeaders";
import { Exception } from "@/Exception/Exception";
import { Method } from "@/Method/Method";
import { FormDataParser } from "@/Parser/FormDataParser";
import { SearchParamsParser } from "@/Parser/SearchParamsParser";
import type { Req } from "@/Req/Req";
import type { Res } from "@/Res/Res";
import { Status } from "@/Status/Status";

export class BodyParser {
	/** This can be used for both request and response bodies */
	async parse(r: Req | Res | Response): Promise<unknown> {
		let data;
		const empty = {};
		const input = r instanceof Request ? r : r instanceof Response ? r : r.response;

		try {
			switch (this.getNormalizedContentType(input)) {
				case "json":
					data = await this.getJsonBody(input);
					break;
				case "form-urlencoded":
					data = await this.getFormUrlEncodedBody(input);
					break;
				case "form-data":
					data = await this.getFormDataBody(input);
					break;
				case "text":
					data = await this.getTextBody(input);
					break;
				case "unknown":
					data = await this.getUnknownBody(input);
					break;
				case "xml":
				case "binary":
				case "pdf":
				case "image":
				case "audio":
				case "video":
					throw new Exception("unprocessable.contentType", Status.UNPROCESSABLE_ENTITY);
				case "no-body-allowed":
				default:
					return empty;
			}

			return data;
		} catch (err) {
			if (err instanceof SyntaxError) return empty;
			throw err;
		}
	}

	getNormalizedContentType(input: Request | Response): string {
		const contentTypeHeader = input.headers.get(CommonHeaders.ContentType) || "";

		if (
			"method" in input &&
			typeof input.method === "string" &&
			!arrIncludes(input.method.toUpperCase(), [
				Method.POST,
				Method.PUT,
				Method.PATCH,
				Method.DELETE,
			])
		) {
			return "no-body-allowed";
		}

		if (contentTypeHeader.includes("application/json")) {
			return "json";
		} else if (contentTypeHeader.includes("application/x-www-form-urlencoded")) {
			return "form-urlencoded";
		} else if (contentTypeHeader.includes("multipart/form-data")) {
			return "form-data";
		} else if (contentTypeHeader.includes("text/plain")) {
			return "text";
		} else if (contentTypeHeader.includes("application/xml")) {
			return "xml";
		} else if (contentTypeHeader.includes("text/xml")) {
			return "xml";
		} else if (contentTypeHeader.includes("application/octet-stream")) {
			return "binary";
		} else if (contentTypeHeader.includes("application/pdf")) {
			return "pdf";
		} else if (contentTypeHeader.includes("image/")) {
			return "image";
		} else if (contentTypeHeader.includes("audio/")) {
			return "audio";
		} else if (contentTypeHeader.includes("video/")) {
			return "video";
		}

		return "unknown";
	}

	private async getJsonBody(req: Request | Response): Promise<unknown> {
		return await req.json();
	}

	private async getFormUrlEncodedBody(input: Request | Response): Promise<unknown> {
		const text = await input.text();
		if (!text || text.trim().length === 0) {
			throw new SyntaxError("Body is empty");
		}

		const searchParams = new URLSearchParams(text);
		const urlSearchParamsParser = new SearchParamsParser();
		return urlSearchParamsParser.toObject(searchParams);
	}

	private async getFormDataBody(input: Request | Response): Promise<UnknownObject> {
		const formData = await input.formData();
		const formDataParser = new FormDataParser();
		return formDataParser.toObject(formData);
	}

	private async getTextBody(input: Request | Response): Promise<string> {
		const contentLength = input.headers.get(CommonHeaders.ContentLength);
		const length = contentLength ? parseInt(contentLength) : 0;

		// 1MB threshold
		if (length > 0 && length < 1024 * 1024) {
			return await input.text();
		}

		const buffer = await input.arrayBuffer();
		const contentType = input.headers.get(CommonHeaders.ContentType) || "";
		const match = contentType.match(/charset=([^;]+)/i);
		const charset = match?.[1] ? match[1].trim() : null;

		const decoder = new TextDecoder(charset || "utf-8");
		return decoder.decode(buffer);
	}

	private async getUnknownBody(input: Request | Response): Promise<unknown> {
		try {
			return await this.getJsonBody(input);
		} catch {
			return await this.getTextBody(input);
		}
	}
}
