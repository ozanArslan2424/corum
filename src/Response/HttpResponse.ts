import { DefaultStatusTexts } from "@/Response/enums/DefaultStatusTexts";
import { Status } from "@/Response/enums/Status";
import { CommonHeaders } from "@/Headers/enums/CommonHeaders";
import { Cookies } from "@/Cookies/Cookies";
import { HttpHeaders } from "@/Headers/HttpHeaders";
import type { HttpResponseBody } from "@/Response/types/HttpResponseBody";
import type { HttpResponseInit } from "@/Response/types/HttpResponseInit";
import { isNil } from "@/utils/isNil";
import { isPrimitive } from "@/utils/isPrimitive";
import { isPlainObject } from "@/utils/isPlainObject";
import type { SseSource } from "@/Response/types/SseSource";
import type { NdjsonSource } from "@/Response/types/NdjsonSource";
import { FileWalker } from "@/FileWalker";
import { HttpError } from "@/Error/HttpError";

/**
 * This is NOT the default response. It provides {@link HttpResponse.response}
 * getter to access web Response with all mutations applied during the
 * handling of the request, JSON body will be handled and cookies will be
 * applied to response headers.
 * */

export class HttpResponse<R = unknown> {
	constructor(
		protected readonly data?: HttpResponseBody<R>,
		protected readonly init?: HttpResponseInit,
	) {
		this.cookies = this.resolveCookies();
		this.headers = this.resolveHeaders();
		this.body = this.resolveBody();
		this.status = this.resolveStatus();
		this.statusText = this.getDefaultStatusText();
	}

	body: BodyInit;
	headers: HttpHeaders;
	status: Status;
	statusText: string;
	cookies: Cookies;

	get response(): Response {
		return new Response(this.body, {
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
		});
	}

	static redirect(url: string | URL, init?: HttpResponseInit): HttpResponse {
		const res = new HttpResponse(undefined, {
			...init,
			status: init?.status ?? Status.FOUND,
			statusText: init?.statusText ?? DefaultStatusTexts[Status.FOUND],
		});
		const urlString = url instanceof URL ? url.toString() : url;
		res.headers.set(CommonHeaders.Location, urlString);
		return res;
	}

	static permanentRedirect(
		url: string | URL,
		init?: Omit<HttpResponseInit, "status">,
	): HttpResponse {
		return this.redirect(url, {
			...init,
			status: Status.MOVED_PERMANENTLY,
		});
	}

	static temporaryRedirect(
		url: string | URL,
		init?: Omit<HttpResponseInit, "status">,
	): HttpResponse {
		return this.redirect(url, { ...init, status: Status.TEMPORARY_REDIRECT });
	}

	static seeOther(
		url: string | URL,
		init?: Omit<HttpResponseInit, "status">,
	): HttpResponse {
		return this.redirect(url, { ...init, status: Status.SEE_OTHER });
	}

	private static createStream(
		execute: (
			controller: ReadableStreamDefaultController,
			isCancelled: () => boolean,
		) => (() => void) | void,
	): ReadableStream {
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
	}

	static sse(
		source: SseSource,
		init?: Omit<HttpResponseInit, "status">,
		retry?: number,
	): HttpResponse {
		const encoder = new TextEncoder();
		const stream = HttpResponse.createStream((controller, isCancelled) => {
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
		const res = new HttpResponse(stream, { ...init, status: Status.OK });
		res.headers.setMany({
			[CommonHeaders.ContentType]: "text/event-stream",
			[CommonHeaders.CacheControl]: "no-cache",
			[CommonHeaders.Connection]: "keep-alive",
		});
		return res;
	}

	static ndjson(
		source: NdjsonSource,
		init?: Omit<HttpResponseInit, "status">,
	): HttpResponse {
		const encoder = new TextEncoder();
		const stream = HttpResponse.createStream((controller, isCancelled) => {
			return source((item) => {
				if (isCancelled()) return;
				controller.enqueue(encoder.encode(`${JSON.stringify(item)}\n`));
			});
		});
		const res = new HttpResponse(stream, { ...init, status: Status.OK });
		res.headers.setMany({
			[CommonHeaders.ContentType]: "application/x-ndjson",
			[CommonHeaders.CacheControl]: "no-cache",
		});
		return res;
	}

	static async streamFile(
		filePath: string,
		disposition: "attachment" | "inline" = "attachment",
		init?: Omit<HttpResponseInit, "status">,
	): Promise<HttpResponse> {
		const file = await FileWalker.find(filePath);
		if (!file) {
			throw HttpError.notFound();
		}
		const stream = file.stream();
		const res = new HttpResponse(stream, { ...init, status: Status.OK });
		res.headers.setMany({
			[CommonHeaders.ContentType]: file?.mimeType,
			[CommonHeaders.ContentDisposition]: `${disposition}; filename="${file.name}"`,
		});
		return res;
	}

	private resolveCookies(): Cookies {
		return new Cookies(this.init?.cookies);
	}

	private resolveHeaders(): HttpHeaders {
		const headers = new HttpHeaders(this.init?.headers);

		const setCookieHeaders = this.cookies.toSetCookieHeaders();

		if (setCookieHeaders.length > 0) {
			for (const header of setCookieHeaders) {
				headers.append(CommonHeaders.SetCookie, header);
			}
		}

		return headers;
	}

	private resolveStatus(): Status {
		if (this.init?.status) return this.init.status;
		if (this.headers.has(CommonHeaders.Location)) {
			return Status.FOUND;
		}
		return Status.OK;
	}

	private setContentType(value: string): void {
		if (
			!this.headers.has(CommonHeaders.ContentType) ||
			this.headers.get(CommonHeaders.ContentType) === "text/plain"
		) {
			this.headers.set(CommonHeaders.ContentType, value);
		}
	}

	// order important here
	private resolveBody(): BodyInit {
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
	}

	private getDefaultStatusText(): string {
		const key = this.status as keyof typeof DefaultStatusTexts;
		return DefaultStatusTexts[key] ?? "Unknown";
	}
}
