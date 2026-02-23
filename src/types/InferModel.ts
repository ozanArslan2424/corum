import type { InferSchema } from "@/types/InferSchema";
import type { Prettify } from "@/types/Prettify";
import type { RouteModel } from "@/types/RouteModel";
import type { Schema } from "@/types/Schema";

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
