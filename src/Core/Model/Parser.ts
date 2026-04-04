import { Status } from "@/Core/CResponse/Status";
import { Method } from "@/Core/CRequest/Method";
import { CommonHeaders } from "@/Core/CHeaders/CommonHeaders";
import { CError } from "@/Core/CError/CError";
import type { CRequest } from "@/Core/CRequest/CRequest";
import type { CResponse } from "@/Core/CResponse/CResponse";
import type { StandardSchemaV1 } from "@/Core/Model/StandardSchema";
import type { SchemaValidator } from "@/Core/Model/SchemaValidator";
import type { UnknownObject } from "@/Utils/UnknownObject";
import { arrIncludes } from "@/Utils/arrIncludes";
import { isObjectWith } from "@/Utils/isObjectWith";
import { objAppendEntry } from "@/Utils/objAppendEntry";

export class Parser {
	static async parse<T = UnknownObject>(
		data: unknown,
		validate?: SchemaValidator<T>,
	): Promise<T> {
		if (!validate) return data as T;
		const result = await validate(data);
		if (result.issues !== undefined) {
			const msg = this.issuesToErrorMessage(result.issues);
			throw new CError(msg, Status.UNPROCESSABLE_ENTITY, data);
		}
		return result.value;
	}

	static issuesToErrorMessage(
		issues: readonly StandardSchemaV1.Issue[],
	): string {
		if (issues.length === 0) return "";

		return issues
			.map((issue) => {
				if (!issue.path || issue.path.length === 0) {
					return issue.message;
				}

				const key = issue.path
					.map((segment) =>
						isObjectWith<{ key: string }>(segment, "key")
							? String(segment.key)
							: String(segment as string),
					)
					.join(".");

				return `${key}: ${issue.message}`;
			})
			.join("\n");
	}

	static async parseUrlData<P = UnknownObject>(
		params: Record<string, string>,
		validate?: SchemaValidator<P>,
	): Promise<P> {
		const data: UnknownObject = {};
		for (const [key, value] of Object.entries(params)) {
			data[key] = decodeURIComponent(value);
		}
		return await this.parse(data, validate);
	}

	/** This can be used for both request and response bodies */
	static async parseBody<B = UnknownObject>(
		r: CRequest | CResponse | Response,
		validate?: SchemaValidator<B>,
	): Promise<B> {
		let data;
		const empty = {} as B;
		const input =
			r instanceof Request ? r : r instanceof Response ? r : r.response;

		try {
			switch (Parser.getNormalizedContentType(input)) {
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
					throw new CError(
						"unprocessable.contentType",
						Status.UNPROCESSABLE_ENTITY,
					);
				case "no-body-allowed":
				default:
					return empty;
			}

			return await this.parse(data, validate);
		} catch (err) {
			if (err instanceof SyntaxError) return empty;
			throw err;
		}
	}

	private static async getUnknownBody<B = UnknownObject>(
		input: Request | Response,
		validate?: SchemaValidator<B>,
	): Promise<unknown> {
		if (!validate) {
			return await this.getTextBody(input);
		}
		try {
			return await this.getJsonBody(input);
		} catch {
			return await this.getTextBody(input);
		}
	}

	private static async getJsonBody(req: Request | Response): Promise<unknown> {
		return await req.json();
	}

	private static async getFormUrlEncodedBody(
		input: Request | Response,
	): Promise<unknown> {
		const text = await input.text();
		if (!text || text.trim().length === 0) {
			throw new SyntaxError("Body is empty");
		}

		const params = new URLSearchParams(text);
		const body: Record<string, any> = {};

		for (const [key, value] of params.entries()) {
			objAppendEntry(body, key, value);
		}

		return body;
	}

	private static async getFormDataBody(
		input: Request | Response,
	): Promise<unknown> {
		const formData = await input.formData();
		const entries = formData.entries() as IterableIterator<
			[string, FormDataEntryValue]
		>;

		const body: UnknownObject = {};

		for (const [key, value] of entries) {
			objAppendEntry(body, key, value);
		}

		return body;
	}

	private static async getTextBody(
		input: Request | Response,
	): Promise<unknown> {
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

	static getNormalizedContentType(input: Request | Response): string {
		const contentTypeHeader =
			input.headers.get(CommonHeaders.ContentType) || "";

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
		} else if (
			contentTypeHeader.includes("application/x-www-form-urlencoded")
		) {
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

	// NOTE: This seems like a good approach to write simpler schemas however,
	// it might not be the best idea since it's fragile and not ver intuitive
	// with encoded params
	//
	// static processString(value: string): string | boolean | number {
	// 	let processedValue: string | boolean | number = value;
	// 	if (!strIsDefined(value)) return "";
	//
	// 	if (/^-?\d+(\.\d+)?$/.test(value)) {
	// 		processedValue = Number(value);
	// 	} else if (
	// 		value.toLowerCase() === "true" ||
	// 		value.toLowerCase() === "false"
	// 	) {
	// 		processedValue = value.toLowerCase() === "true";
	// 	}
	//
	// 	return processedValue;
	// }
}
