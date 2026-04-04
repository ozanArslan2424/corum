import type { OrString } from "@/Utils/OrString";
import type { UnknownObject } from "@/Utils/UnknownObject";

export function isObjectWith<T extends UnknownObject>(
	item: unknown,
	key: OrString<keyof T>,
): item is T {
	return (
		item !== null &&
		item !== undefined &&
		typeof item === "object" &&
		key in item
	);
}
