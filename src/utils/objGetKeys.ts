export function objGetKeys<K extends string>(
	obj: Record<string, unknown>,
): Array<K> {
	return Object.keys(obj) as Array<K>;
}
