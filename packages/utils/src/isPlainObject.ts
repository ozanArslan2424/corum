export function isPlainObject(input: unknown): input is Record<string, unknown> {
	return typeof input === "object" && input?.constructor === Object;
}
