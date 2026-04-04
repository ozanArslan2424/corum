import { DefaultStatusTexts } from "@/Core/CResponse/DefaultStatusTexts";
import { Status } from "@/Core/CResponse/Status";
import { CommonHeaders } from "@/Core/CHeaders/CommonHeaders";
import { Cookies } from "@/Core/Cookies/Cookies";
import { CHeaders } from "@/Core/CHeaders/CHeaders";
import type { CResponseBody } from "@/Core/CResponse/CResponseBody";
import type { CResponseInit } from "@/Core/CResponse/CResponseInit";
import type { SseSource } from "@/Core/CResponse/SseSource";
import type { NdjsonSource } from "@/Core/CResponse/NdjsonSource";
import { CError } from "@/Core/CError/CError";
import { XFile } from "@/Extra/XFile/XFile";
import { isNil } from "@/Utils/isNil";
import { isPrimitive } from "@/Utils/isPrimitive";
import { isPlainObject } from "@/Utils/isPlainObject";
import { Func } from "@/Utils/Func";

/**
 * Represents an HTTP response. Pass it a body and optional init to construct a response,
 * or use the static methods for common patterns like redirects and streaming.
 *
 * The body is automatically serialized based on its type:
 * - `null` / `undefined` → empty body with `text/plain`
 * - Primitives (`string`, `number`, `boolean`, `bigint`) → string with `text/plain`
 * - `Date` → ISO string with `text/plain`
 * - Plain objects and arrays → JSON string with `application/json`
 * - `ArrayBuffer` → binary with `application/octet-stream`
 * - `Blob` → binary with the Blob's own mime type
 * - `FormData` → multipart with `multipart/form-data`
 * - `URLSearchParams` → encoded with `application/x-www-form-urlencoded`
 * - `ReadableStream` → streamed as-is, set `Content-Type` manually via `init.headers`
 * - Custom class instances → falls back to `.toString()`
 *
 * Use {@link CResponse.response} to get the native web `Response` to return from a route handler.
 *
 * Static helpers:
 * - {@link CResponse.redirect} / {@link CResponse.permanentRedirect} / {@link CResponse.temporaryRedirect} / {@link CResponse.seeOther} — HTTP redirects
 * - {@link CResponse.sse} — Server-Sent Events stream
 * - {@link CResponse.ndjson} — Newline-delimited JSON stream
 * - {@link CResponse.streamFile} — Stream a file from disk
 * - {@link CResponse.file} — Respond with a static file
 */

export class CResponse<R = unknown> {
	constructor(
		public data?: CResponseBody<R>,
		protected readonly init?: CResponseInit | CResponse,
	) {
		this.cookies = this.resolveCookies();
		this.headers = this.resolveHeaders();
		this.body = this.resolveBody();
		this.status = this.resolveStatus();
		this.statusText = CResponse.getDefaultStatusText(this.status);
	}

	body: BodyInit;
	headers: CHeaders;
	status: Status;
	statusText: string;
	cookies: Cookies;

	get response(): Response {
		const setCookieHeaders = this.cookies.toSetCookieHeaders();

		if (setCookieHeaders.length > 0) {
			for (const header of setCookieHeaders) {
				this.headers.append(CommonHeaders.SetCookie, header);
			}
		}

		return new Response(this.body, {
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
		});
	}

	static redirect = Func.time(
		"CResponse.redirect",
		(url: string | URL, init?: CResponseInit): CResponse => {
			const res = new CResponse(undefined, {
				...init,
				status: init?.status ?? Status.FOUND,
				statusText: init?.statusText ?? DefaultStatusTexts[Status.FOUND],
			});
			const urlString = url instanceof URL ? url.toString() : url;
			res.headers.set(CommonHeaders.Location, urlString);
			return res;
		},
	);

	static permanentRedirect = Func.time(
		"CResponse.permanentRedirect",
		(url: string | URL, init?: Omit<CResponseInit, "status">): CResponse => {
			return this.redirect(url, {
				...init,
				status: Status.MOVED_PERMANENTLY,
			});
		},
	);

	static temporaryRedirect = Func.time(
		"CResponse.temporaryRedirect",
		(url: string | URL, init?: Omit<CResponseInit, "status">): CResponse => {
			return this.redirect(url, { ...init, status: Status.TEMPORARY_REDIRECT });
		},
	);

	static seeOther = Func.time(
		"CResponse.seeOther",
		(url: string | URL, init?: Omit<CResponseInit, "status">): CResponse => {
			return this.redirect(url, { ...init, status: Status.SEE_OTHER });
		},
	);

	static sse = Func.time(
		"CResponse.sse",
		(
			source: SseSource,
			init?: Omit<CResponseInit, "status">,
			retry?: number,
		): CResponse => {
			const encoder = new TextEncoder();
			const stream = CResponse.createStream((controller, isCancelled) => {
				return source((event) => {
					if (isCancelled()) return;
					let chunk = "";
					if (retry !== undefined) chunk += `retry: ${retry}\n`;
					if (event.id) chunk += `id: ${event.id}\n`;
					if (event.event) chunk += `event: ${event.event}\n`;
					chunk += `data: ${JSON.stringify(event.data)}\n\n`;
					controller.enqueue(encoder.encode(chunk));
				});
			});
			const res = new CResponse(stream, { ...init, status: Status.OK });
			res.headers.setMany({
				[CommonHeaders.ContentType]: "text/event-stream",
				[CommonHeaders.CacheControl]: "no-cache",
				[CommonHeaders.Connection]: "keep-alive",
			});
			return res;
		},
	);

	static ndjson = Func.time(
		"CResponse.ndjson",
		(source: NdjsonSource, init?: Omit<CResponseInit, "status">): CResponse => {
			const encoder = new TextEncoder();
			const stream = CResponse.createStream((controller, isCancelled) => {
				return source((item) => {
					if (isCancelled()) return;
					controller.enqueue(encoder.encode(`${JSON.stringify(item)}\n`));
				});
			});
			const res = new CResponse(stream, { ...init, status: Status.OK });
			res.headers.setMany({
				[CommonHeaders.ContentType]: "application/x-ndjson",
				[CommonHeaders.CacheControl]: "no-cache",
			});
			return res;
		},
	);

	static streamFile = Func.time(
		"CResponse.streamFile",
		async (
			filePath: string,
			disposition: "attachment" | "inline" = "attachment",
			init?: Omit<CResponseInit, "status">,
		): Promise<CResponse<ReadableStream>> => {
			const file = new XFile(filePath);
			const exists = await file.exists();
			if (!exists) {
				throw new CError(
					Status.NOT_FOUND.toString(),
					Status.NOT_FOUND,
					new CResponse({ filePath }, init),
				);
			}
			const stream = file.stream();
			const res = new CResponse(stream, { ...init, status: Status.OK });
			res.headers.setMany({
				[CommonHeaders.ContentType]: file.mimeType,
				[CommonHeaders.ContentDisposition]: `${disposition}; filename="${file.name}"`,
			});
			return res;
		},
	);

	static file = Func.time(
		"CResponse.file",
		async (
			filePath: string,
			init?: CResponseInit,
		): Promise<CResponse<string>> => {
			const file = new XFile(filePath);
			const exists = await file.exists();
			if (!exists) {
				throw new CError(
					Status.NOT_FOUND.toString(),
					Status.NOT_FOUND,
					new CResponse({ filePath }, init),
				);
			}
			const content = await file.text();
			const res = new CResponse(content, init);
			res.headers.setMany({
				[CommonHeaders.ContentType]: file.mimeType,
				[CommonHeaders.ContentLength]: content.length.toString(),
			});
			return res;
		},
	);

	static getDefaultStatusText(status: number): string {
		const key = status as keyof typeof DefaultStatusTexts;
		return DefaultStatusTexts[key] ?? "Unknown";
	}

	private static createStream = Func.time(
		"CResponse.createStream",
		(
			execute: (
				controller: ReadableStreamDefaultController,
				isCancelled: () => boolean,
			) => (() => void) | void,
		): ReadableStream => {
			let cancelled = false;
			let cleanup: (() => void) | void;

			return new ReadableStream({
				start(controller) {
					try {
						cleanup = execute(controller, () => cancelled);
						if (typeof cleanup !== "function") {
							controller.close();
						}
					} catch (err) {
						controller.error(err);
					}
				},
				cancel() {
					cancelled = true;
					cleanup?.();
				},
			});
		},
	);

	private resolveCookies = Func.time(
		"CResponse.resolveCookies",
		(): Cookies => {
			return this.init?.cookies instanceof Cookies
				? this.init.cookies
				: new Cookies(this.init?.cookies);
		},
	);

	private resolveHeaders = Func.time(
		"CResponse.resolveHeaders",
		(): CHeaders => {
			return new CHeaders(this.init?.headers);
		},
	);

	private resolveStatus = Func.time("CResponse.resolveStatus", (): Status => {
		if (this.init?.status) return this.init.status;
		if (this.headers.has(CommonHeaders.Location)) {
			return Status.FOUND;
		}
		return Status.OK;
	});

	private setContentType = Func.time(
		"CResponse.setContentType",
		(value: string): void => {
			if (
				!this.headers.has(CommonHeaders.ContentType) ||
				this.headers.get(CommonHeaders.ContentType) === "text/plain"
			) {
				this.headers.set(CommonHeaders.ContentType, value);
			}
		},
	);

	// order important here
	private resolveBody = Func.time("CResponse.resolveBody", (): BodyInit => {
		if (isNil(this.data)) {
			this.setContentType("text/plain");
			return "";
		}

		if (isPrimitive(this.data)) {
			this.setContentType("text/plain");
			return String(this.data);
		}

		if (this.data instanceof ArrayBuffer) {
			this.setContentType("application/octet-stream");
			return this.data;
		}

		if (this.data instanceof Blob) {
			if (this.data.type) this.setContentType(this.data.type);
			return this.data;
		}

		if (this.data instanceof FormData) {
			this.setContentType("multipart/form-data");
			return this.data;
		}

		if (this.data instanceof URLSearchParams) {
			this.setContentType("application/x-www-form-urlencoded");
			return this.data;
		}

		if (this.data instanceof ReadableStream) {
			return this.data;
		}

		if (this.data instanceof Date) {
			this.setContentType("text/plain");
			return this.data.toISOString();
		}

		if (Array.isArray(this.data) || isPlainObject(this.data)) {
			this.setContentType("application/json");
			return JSON.stringify(this.data);
		}

		// Handle other objects (custom classes, etc.)
		this.setContentType("text/plain");
		// oxlint-disable-next-line typescript/no-base-to-string
		return String(this.data);
	});
}
