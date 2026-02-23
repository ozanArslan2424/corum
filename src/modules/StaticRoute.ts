/**
 * The object to define a route that serves a static file. Can be instantiated with "new" or inside a controller
 * with {@link ControllerAbstract.staticRoute}. The callback recieves the {@link Context} and can
 * return {@link HttpResponse} or any data. Route instantiation automatically registers
 * to the router.
 * */

import { Status } from "@/enums/Status";
import { Method } from "@/enums/Method";
import { RouteVariant } from "@/enums/RouteVariant";
import { FileWalker } from "@/modules/FileWalker";
import { HttpError } from "@/modules/HttpError";
import { HttpResponse } from "@/modules/HttpResponse";
import { JS } from "@/modules/JS";
import { RouteAbstract } from "@/modules/RouteAbstract";
import type { OrString } from "@/types/OrString";
import type { RouteHandler } from "@/types/RouteHandler";
import type { RouteId } from "@/types/RouteId";
import type { RouteModel } from "@/types/RouteModel";
import { getRouterInstance } from "@/index";

export class StaticRoute<Path extends string = string> extends RouteAbstract<
	Path,
	HttpResponse<string>
> {
	constructor(
		path: Path,
		private filePath: string,
		extension?: OrString<"html" | "css" | "js" | "ts">,
	) {
		super();
		this.variant = RouteVariant.static;
		this.method = Method.GET;
		this.endpoint = this.resolveEndpoint(path, this.variant);
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);

		this.extension = extension || this.filePath.split(".").pop() || "txt";
		getRouterInstance().addRoute(this);
	}

	extension: string;
	id: RouteId;
	variant: RouteVariant;
	method: Method;
	endpoint: Path;
	pattern: RegExp;
	model?:
		| RouteModel<HttpResponse<string>, unknown, unknown, unknown>
		| undefined;
	handler: RouteHandler<HttpResponse<string>> = async () => {
		switch (this.extension) {
			case "html":
				return await this.handleHtml();
			case "css":
				return await this.handleCss();
			case "js":
				return await this.handleJs();
			case "ts":
				return await this.handleTs();
			default:
				return await this.handleFile();
		}
	};

	private async handleHtml() {
		const content = await this.getContent();
		return this.toResponse(content);
	}

	private async handleCss() {
		const content = await this.getContent();
		return this.toResponse(content);
	}

	private async handleJs() {
		const content = await this.getContent();
		return this.toResponse(content);
	}

	private async handleTs() {
		const content = await this.getContent();
		const fileName = this.getFileName();
		const transpiled = await JS.transpile(fileName, content);
		return this.toResponse(transpiled);
	}

	// TODO: Compress images and other binary files
	private async handleFile() {
		const content = await this.getContent();
		return this.toResponse(content);
	}

	private getFileName(): string {
		return this.filePath.split("/").pop() ?? "unknown.ts";
	}

	private async getContent(): Promise<string> {
		const content = await FileWalker.read(this.filePath);
		if (!content) {
			console.error("File not found at:", this.filePath);
			throw HttpError.notFound();
		}
		return content;
	}

	private toResponse(content: string) {
		const contentType =
			this.mimeTypes[this.extension] || "application/octet-stream";
		const contentLength = content.length.toString();
		return new HttpResponse(content, {
			status: Status.OK,
			headers: {
				"Content-Type": contentType,
				"Content-Length": contentLength,
			},
		});
	}

	private mimeTypes: Record<string, string> = {
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		js: "application/javascript",
		mjs: "application/javascript",
		json: "application/json",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		svg: "image/svg+xml",
		ico: "image/x-icon",
		txt: "text/plain",
		xml: "application/xml",
		pdf: "application/pdf",
		zip: "application/zip",
		mp3: "audio/mpeg",
		mp4: "video/mp4",
		webm: "video/webm",
		woff: "font/woff",
		woff2: "font/woff2",
		ttf: "font/ttf",
	};
}
