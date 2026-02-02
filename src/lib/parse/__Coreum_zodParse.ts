import type { __Coreum_ZodSchemaType } from "@/lib/parse/__Coreum_ZodSchemaType";

export function __Coreum_zodParse<Schema extends unknown>(
	data: unknown,
	schema: __Coreum_ZodSchemaType<Schema>,
	errorMessage: string,
): Schema {
	const result = schema.safeParse(data);
	if (!result.success) {
		throw new Error(errorMessage, result.error);
	}
	return result.data as Schema;
}
