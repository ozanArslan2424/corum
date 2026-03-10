import { FileWalkerAbstract } from "@/FileWalker/FileWalkerAbstract";
import type { FileWalkerFile } from "@/FileWalker/types/FileWalkerFile";

export class FileWalkerUsingBun extends FileWalkerAbstract {
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
		return (await this.find(filePath)) !== null;
	}

	static async find(filePath: string): Promise<FileWalkerFile | null> {
		const file = Bun.file(filePath);
		const exists = await file.exists();
		if (exists) {
			return {
				name: this.getFilename(filePath),
				extension: this.getExtension(filePath),
				mimeType: this.getMimeType(filePath),
				text: () => file.text(),
				stream: () => file.stream(),
			};
		}
		return null;
	}
}
