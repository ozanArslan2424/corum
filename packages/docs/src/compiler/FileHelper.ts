import fs from "fs/promises";
import path from "path";

import { X } from "@ozanarslan/corpus";

export class FileHelper {
	constructor(private readonly outDir: string) {}

	addr(...p: string[]) {
		if (X.Config.nodeEnv === "development") {
			return path.resolve(process.cwd(), "src", ...p);
		}
		return path.resolve(process.cwd(), ...p);
	}

	out(...p: string[]) {
		return path.resolve(this.outDir, ...p);
	}

	async files(dirPath: string, ext: string) {
		const files: string[] = [];
		const entries = await fs.readdir(dirPath, { withFileTypes: true, recursive: true });
		for (const entry of entries) {
			if (entry.isFile()) {
				const fullPath = path.join(entry.parentPath, entry.name);
				if (fullPath.endsWith(`.${ext}`)) files.push(fullPath);
			}
		}
		return files;
	}

	async write(filePath: string, data: string | Buffer) {
		const dir = path.dirname(filePath);
		await fs.mkdir(dir, { recursive: true });
		await fs.writeFile(filePath, data);
	}
}
