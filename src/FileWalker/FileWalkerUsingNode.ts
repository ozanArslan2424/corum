import { FileWalkerAbstract } from "@/FileWalker/FileWalkerAbstract";
import type { FileWalkerFile } from "@/FileWalker/types/FileWalkerFile";
import fs from "node:fs";

export class FileWalkerUsingNode extends FileWalkerAbstract {
	static async read(filePath: string): Promise<string | null> {
		try {
			const file = await this.find(filePath);
			if (!file) return null;
			return await file.text();
		} catch {
			return null;
		}
	}

	static async exists(filePath: string): Promise<boolean> {
		return fs.existsSync(filePath);
	}

	static async find(filePath: string): Promise<FileWalkerFile | null> {
		try {
			const exists = await this.exists(filePath);
			if (!exists) return null;
			return {
				name: this.getFilename(filePath),
				extension: this.getExtension(filePath),
				mimeType: this.getMimeType(filePath),
				text: async () => fs.readFileSync(filePath, "utf-8"),
				stream: () => this.streamFile(filePath),
			};
		} catch {
			return null;
		}
	}

	private static streamFile(filePath: string): ReadableStream {
		const nodeStream = fs.createReadStream(filePath);
		return new ReadableStream({
			start(controller) {
				nodeStream.on("data", (chunk) => {
					controller.enqueue(
						typeof chunk === "string"
							? new TextEncoder().encode(chunk)
							: new Uint8Array(chunk),
					);
				});
				nodeStream.on("end", () => controller.close());
				nodeStream.on("error", (err) => controller.error(err));
			},
			cancel() {
				nodeStream.destroy();
			},
		});
	}
}
