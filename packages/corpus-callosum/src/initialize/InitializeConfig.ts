export type InitializeConfig = Partial<{
	/**
	 * Casing for file and directory names,
	 *
	 * @default "pascal"
	 */
	casing: "pascal" | "camel" | "kebab";

	/**
	 * Suppress console logs.
	 *
	 * @default false
	 */
	silent: boolean;

	/**
	 * Database client file path.
	 *
	 * @default null
	 */
	dbFilePath: string | null;

	/**
	 * Validation Library to generate models using.
	 * Append version number with @ if you need a specific version.
	 *
	 * Default versions:
	 * arktype: "2.2.0"
	 * valibot: "1.3.1"
	 * yup: "1.7.1"
	 * zod: "4.3.6"
	 *
	 * @default null
	 */
	validationLibrary:
		| "arktype"
		| "zod"
		| "valibot"
		| "yup"
		| (string & {})
		| null;

	/**
	 * Package manager to install any missing dependencies with.
	 * Also picks up from package.json
	 * Default is bun since corpus uses bun runtime.
	 *
	 * @default "bun"
	 */
	packageManager: "bun" | "pnpm" | "npm" | null;
}>;
