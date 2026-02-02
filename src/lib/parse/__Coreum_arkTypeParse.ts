import type { __Coreum_ArkTypeSchemaType } from "@/lib/parse/__Coreum_ArkTypeSchemaType";
import { type } from "arktype";

export function __Coreum_arkTypeParse<Schema extends unknown>(
	data: unknown,
	schema: __Coreum_ArkTypeSchemaType<Schema>,
	errorMessage: string,
): Schema {
	const result = schema(data);
	if (result instanceof type.errors) {
		throw new Error(errorMessage, result.toTraversalError());
	} else {
		return result as Schema;
	}
}
