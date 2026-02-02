import type { ValueOf } from "@/utils/ValueOf";

export const __Coreum_RuntimeOptions = {
	bun: "bun",
	node: "node",
} as const;

export type __Coreum_RuntimeOptions = ValueOf<typeof __Coreum_RuntimeOptions>;
