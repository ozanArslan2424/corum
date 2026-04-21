export interface XFileInterface {
	/**
	 * The path from constructor.
	 */
	readonly path: string;

	/**
	 * The name of the file without the extension.
	 */
	get name(): string;

	/**
	 * The file extension (e.g., "html", "md"), excluding the leading dot.
	 */
	get extension(): string;

	/**
	 * The full name of the file, including the extension.
	 */
	get fullname(): string;

	/**
	 * The standard MIME type associated with the file's extension.
	 */
	get mimeType(): string;

	/**
	 * Gets the parent directory names as an array, ordered from the immediate parent up to the root.
	 * @returns {string[]} An array of parent directory names in reversed order.
	 */
	get parentDirs(): string[];

	/**
	 * Checks if the file exists in the file system.
	 * @returns {Promise<boolean>} A promise that resolves to true if the file exists.
	 */
	exists(): Promise<boolean>;

	/**
	 * Reads the file content and returns it as a string.
	 * @returns {Promise<string>} A promise that resolves to the file's text content.
	 */
	text(): Promise<string>;

	/**
	 * Opens a readable stream to the file's content.
	 * @returns {ReadableStream} A stream for reading the file data.
	 */
	stream(): ReadableStream;
}
