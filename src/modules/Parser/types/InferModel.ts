import type { RouteModel } from "@/modules/Parser/types/RouteModel";
import type { Schema, InferSchema } from "@/modules/Parser/types/Schema";
import type { Prettify } from "@/utils/Prettify";

// // prettier-ignore
// export type InferModel<T extends Record<string, any>> = {
// 	[K in keyof T]: T[K] extends RouteModel<any, any, any, any>
// 	?
// 	RemoveNever<{
// 		body: T[K]["body"] extends Schema ? InferSchema<T[K]["body"]> : never;
// 		response: T[K]["response"] extends Schema ? InferSchema<T[K]["response"]> : never;
// 		params: T[K]["params"] extends Schema ? InferSchema<T[K]["params"]> : never;
// 		query: T[K]["query"] extends Schema ? InferSchema<T[K]["query"]> : never;
// 	}>
// 	:
// 	T[K] extends Schema ? InferSchema<T[K]> : never;
// }
//
// export type RemoveNever<T> = {
// 	[K in keyof T as T[K] extends never ? never : K]: T[K];
// };

/** If you prefer to put all schemas into a single object, this will be helpful */
export type InferModel<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends RouteModel<any, any, any, any>
		? Prettify<
				(T[K]["body"] extends Schema
					? { body: InferSchema<T[K]["body"]> }
					: {}) &
					(T[K]["response"] extends Schema
						? { response: InferSchema<T[K]["response"]> }
						: {}) &
					(T[K]["params"] extends Schema
						? { params: InferSchema<T[K]["params"]> }
						: {}) &
					(T[K]["search"] extends Schema
						? { search: InferSchema<T[K]["search"]> }
						: {})
			>
		: T[K] extends Schema
			? InferSchema<T[K]>
			: never;
};
