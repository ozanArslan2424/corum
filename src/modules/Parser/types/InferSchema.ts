import type { Schema } from "@/modules/Parser/types/Schema";

export type InferSchema<T extends Schema> = T["infer"];
