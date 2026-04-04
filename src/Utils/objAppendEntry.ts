export function objAppendEntry(
	data: Record<string, unknown>,
	key: string,
	value: string | boolean | number | File,
) {
	const existing = data[key];
	if (existing !== undefined) {
		data[key] = Array.isArray(existing)
			? [...existing, value]
			: [existing, value];
	} else {
		data[key] = value;
	}
}
