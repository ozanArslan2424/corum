export abstract class FileWalkerAbstract {
	static mimeTypes: Record<string, string> = {
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		js: "application/javascript",
		ts: "application/javascript",
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

	static getMimeType(filePath: string): string {
		return (
			this.mimeTypes[this.getExtension(filePath, "")] ??
			"application/octet-stream"
		);
	}

	static getFilename(filePath: string): string {
		return filePath.split("/").pop() ?? filePath;
	}

	static getExtension(filePath: string, fallback: string = "txt"): string {
		return filePath.split(".").pop() ?? fallback;
	}
}
