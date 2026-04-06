import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, relative, dirname } from "node:path";

export class ImportsManager {
	constructor(
		private readonly cwd: string,
		private readonly MODULE_NAME: string,
		private readonly FALLBACK_DIR_NAME: string,
	) {
		this.srcDir = this.getSrcDir();
		this.targetDir = this.getTargetDir();
		this.moduleDir = this.getModuleDir();
		this.srcAlias = this.getSrcAlias();
	}

	public readonly srcAlias: string | null;
	public readonly srcDir: string;
	public readonly targetDir: string;
	public readonly moduleDir: string;

	private readonly MAIN_FILE_NAME = "main.ts";
	private readonly TSCONFIG_FILE_NAME = "tsconfig.json";
	private readonly SRC_DIR_NAME = "src";

	makeImportPath(fromFile: string, toFile: string): string {
		if (this.srcAlias && toFile.startsWith(this.srcDir)) {
			const rel = toFile
				.replace(this.srcDir, "")
				.replace(/^\//, "")
				.replace(/\.ts$/, "");
			return `${this.srcAlias}/${rel}`;
		} else {
			const rel = relative(dirname(fromFile), toFile).replace(/\.ts$/, "");
			return rel.startsWith(".") ? rel : `./${rel}`;
		}
	}

	private getSrcAlias(): string | null {
		const tsconfigPath = join(this.cwd, this.TSCONFIG_FILE_NAME);
		if (!existsSync(tsconfigPath)) {
			console.log(`No ${this.TSCONFIG_FILE_NAME} found, skipping path aliases`);
			return null;
		}
		const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));
		const paths = tsconfig.compilerOptions?.paths ?? {};
		for (const [alias, targets] of Object.entries(paths)) {
			const target = (targets as string[])[0] ?? "";
			if (target.includes(this.SRC_DIR_NAME)) {
				return alias.replace("/*", "");
			}
		}
		return null;
	}

	private getSrcDir() {
		const srcDir = join(this.cwd, this.SRC_DIR_NAME);
		if (!existsSync(srcDir)) {
			mkdirSync(srcDir, { recursive: true });
			console.log(`📁 Created ${this.SRC_DIR_NAME} directory.`);
		}
		return srcDir;
	}

	private getTargetDir() {
		let targetDir: string;
		if (existsSync(join(this.srcDir, this.MAIN_FILE_NAME))) {
			targetDir = join(this.srcDir, this.FALLBACK_DIR_NAME);
		} else {
			targetDir = this.srcDir;
			mkdirSync(targetDir, { recursive: true });
		}
		return targetDir;
	}

	private getModuleDir() {
		const moduleDir = join(this.targetDir, this.MODULE_NAME);
		mkdirSync(moduleDir, { recursive: true });
		return moduleDir;
	}
}
