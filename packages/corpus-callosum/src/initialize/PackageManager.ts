import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { logFatal } from "corpus-utils/internalLog";
import { DEFAULT_VALIDATION_LIB_VERSIONS } from "../utils/ACCEPTED_VALIDATION_LIBS";

const __dirname = dirname(fileURLToPath(import.meta.url));

export class PackageManager {
	constructor(pm: string | null) {
		this.pm = pm ?? this.pkg.packageManager?.split("@")?.[0] ?? "bun";
	}

	private readonly pm: string;

	pkg = JSON.parse(
		readFileSync(join(__dirname, "../../package.json"), "utf-8"),
	);

	async run(s: string) {
		switch (this.pm) {
			case "bun":
			default:
				return Bun.$`bun run ${s}`;
			case "pnpm":
				return Bun.$`pnpm run ${s}`;
			case "npm":
				return Bun.$`npm run ${s}`;
		}
	}

	async add(s: string, version?: string, dev?: boolean) {
		const pkg = `${s}${version ? `@${version}` : ""}`;
		switch (this.pm) {
			case "bun":
			default:
				return dev ? Bun.$`bun add -D ${pkg}` : Bun.$`bun add ${pkg}`;
			case "pnpm":
				return dev ? Bun.$`pnpm add -D ${pkg}` : Bun.$`pnpm add ${pkg}`;
			case "npm":
				return dev ? Bun.$`npm install -D ${pkg}` : Bun.$`npm install ${pkg}`;
		}
	}

	async remove(s: string) {
		switch (this.pm) {
			case "bun":
			default:
				return Bun.$`bun remove ${s}`;
			case "pnpm":
				return Bun.$`pnpm remove ${s}`;
			case "npm":
				return Bun.$`npm remove ${s}`;
		}
	}

	getVersion(pkgName: string) {
		const thisVersion: string =
			this.pkg.devDependencies[pkgName] ?? this.pkg.dependencies[pkgName];
		if (thisVersion.includes("workspace")) {
			return this.pkg.version;
		}
		return thisVersion;
	}

	generatePackageContent(
		name: string,
		pkgs: { name: string; version: string; dev?: boolean }[],
	) {
		const dependencies: Record<string, string> = {};
		const devDependencies: Record<string, string> = {};
		for (const pkg of pkgs) {
			if (pkg.dev) {
				devDependencies[pkg.name] = pkg.version;
			} else {
				dependencies[pkg.name] = pkg.version;
			}
		}

		return {
			name,
			private: true,
			scripts: {
				build: "bun run build.ts",
				dev: "bun run src/main.ts",
				start: "bun run dist/index.js",
			},
			dependencies: {
				"@ozanarslan/corpus": this.getVersion("@ozanarslan/corpus"),
				typescript: this.getVersion("typescript"),
			},
			devDependencies: {
				"@types/bun": this.getVersion("@types/bun"),
			},
		};
	}

	async resolvePackageName(
		cwd: string,
		validationLib: string | null,
	): Promise<string> {
		const pkgs = [
			{
				name: "@ozanarslan/corpus",
				dev: false,
				version: this.getVersion("@ozanarslan/corpus"),
			},
			{ name: "@types/bun", dev: true, version: this.getVersion("@types/bun") },
			{ name: "typescript", dev: true, version: this.getVersion("typescript") },
		];

		if (validationLib) {
			const parts = validationLib.split("@");
			const name = validationLib.includes("@") ? parts[0] : validationLib;
			const version = validationLib.includes("@")
				? (parts[1] ?? "")
				: (DEFAULT_VALIDATION_LIB_VERSIONS[validationLib] ?? "");
			if (!name) logFatal("Invalid validation library name.");
			pkgs.push({ name, dev: false, version });
		}

		const pkgPath = join(cwd, "package.json");
		if (existsSync(pkgPath)) {
			for (const pkg of pkgs) {
				await this.add(pkg.name, pkg.version, pkg.dev);
			}
			const pkgJson = JSON.parse(readFileSync(pkgPath, "utf-8"));

			return (pkgJson.name as string) ?? "app";
		} else {
			const name = cwd.split("/").at(-1) ?? "app";
			writeFileSync(
				pkgPath,
				JSON.stringify(this.generatePackageContent(name, pkgs)),
				"utf-8",
			);
			console.log("📄 Created package.json.");
			return name;
		}
	}
}
