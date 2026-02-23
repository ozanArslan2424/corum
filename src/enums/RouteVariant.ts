import type { ValueOf } from "@/types/ValueOf";

export const RouteVariant = {
	static: "static",
	dynamic: "dynamic",
} as const;

export type RouteVariant = ValueOf<typeof RouteVariant>;
