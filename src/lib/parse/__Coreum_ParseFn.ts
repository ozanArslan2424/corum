import type { __Coreum_SchemaType } from "./__Coreum_SchemaType";

export type __Coreum_ParseFn = <Schema extends unknown>(
	data: unknown,
	schema: __Coreum_SchemaType<Schema>,
	errorMessage: string,
) => Schema;
