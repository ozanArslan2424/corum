import type { Func } from "@/Utils/Func";

export function internFunc<T extends Func>(
	map: Map<string, T>,
	value: T,
	...namespace: string[]
): T {
	const key = namespace.join("::");
	const existing = map.get(key);
	if (existing) return existing as T;
	map.set(key, value);
	return value;
}
