import type { InferSchema, Schema } from "corpus-utils/Schema";
import type { RouteConfig } from "@/Route/RouteConfig";
import type { Prettify } from "corpus-utils/Prettify";

/** If you prefer to put all schemas into a single object, this will be helpful */
export type XInferModel<T extends Record<string, any>> = {
	[K in keyof T as K extends "prototype" ? never : K]: T[K] extends RouteConfig<
		any,
		any,
		any,
		any
	>
		? Prettify<
				(T[K]["body"] extends Schema
					? { body: InferSchema<T[K]["body"]> }
					: {}) &
					(T[K]["search"] extends Schema
						? { search: InferSchema<T[K]["search"]> }
						: {}) &
					(T[K]["params"] extends Schema
						? { params: InferSchema<T[K]["params"]> }
						: {}) &
					(T[K]["response"] extends Schema
						? { response: InferSchema<T[K]["response"]> }
						: {})
			>
		: T[K] extends Schema
			? InferSchema<T[K]>
			: never;
};
