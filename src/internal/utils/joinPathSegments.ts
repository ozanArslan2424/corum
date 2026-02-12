export function joinPathSegments<E extends string = string>(
	...segments: (string | undefined)[]
): E {
	const joined = segments
		.filter(
			(segment): segment is string =>
				segment !== undefined && segment !== null && segment.trim() !== "",
		)
		.map((segment) => segment.replace(/^\/+|\/+$/g, ""))
		.filter((segment) => segment.length > 0)
		.join("/");

	return `/${joined}` as E;
}
