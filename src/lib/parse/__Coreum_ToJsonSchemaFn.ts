import type { __Coreum_SchemaType } from "./__Coreum_SchemaType";

export type __Coreum_ToJsonSchemaFn = <Schema extends unknown>(
	schema: __Coreum_SchemaType<Schema>,
) => unknown;
