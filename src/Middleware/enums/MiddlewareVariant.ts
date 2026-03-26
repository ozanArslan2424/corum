import type { ValueOf } from "@/utils/types/ValueOf";

export const MiddlewareVariant = {
	inbound: "inbound",
	outbound: "outbound",
} as const;

export type MiddlewareVariant = ValueOf<typeof MiddlewareVariant>;
