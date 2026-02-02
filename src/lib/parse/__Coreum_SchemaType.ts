import type { __Coreum_ArkTypeSchemaType } from "./__Coreum_ArkTypeSchemaType";
import type { __Coreum_ZodSchemaType } from "./__Coreum_ZodSchemaType";

export type __Coreum_SchemaType<T extends unknown = unknown> =
	| __Coreum_ZodSchemaType<T> // this one has toJSONSchema
	| __Coreum_ArkTypeSchemaType<T>; // this one has toJsonSchema
