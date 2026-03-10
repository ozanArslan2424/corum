export function isPrimitive(
	input: unknown,
): input is string | number | boolean | bigint {
	return (
		typeof input === "string" ||
		typeof input === "number" ||
		typeof input === "boolean" ||
		typeof input === "bigint"
	);
}
