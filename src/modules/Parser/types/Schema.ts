// import * as ark from "arktype";
// import * as z from "zod";
// import * as v from "valibot";
//
// export type Schema<T = unknown> =
// 	| z.ZodType<T>
// 	| ark.Type<T>
// 	// TODO: valibot tests
// 	| v.AnySchema;
//
// // prettier-ignore
// export type InferSchema<T> =
// T extends z.ZodType ? z.output<T> :
// T extends ark.Type ? T["infer"] :
// T extends v.AnySchema ? v.InferOutput<T> :
// never;

import type { StandardSchemaV1 } from "@/modules/Parser/types/StandardSchema";

export interface Schema<T = unknown> extends StandardSchemaV1<unknown, T> {}

export type InferSchema<T extends Schema> = StandardSchemaV1.InferOutput<T>;
