import type { Schema } from "@/types/Schema";
import type { StandardSchemaV1 } from "@/types/StandardSchema";

export type InferSchema<T extends Schema> = StandardSchemaV1.InferOutput<T>;
