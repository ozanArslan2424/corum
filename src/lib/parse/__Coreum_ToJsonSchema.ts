import { __Coreum_ArkTypeSchemaType } from "./__Coreum_ArkTypeSchemaType";
import { __Coreum_arkTypeToJsonSchema } from "./__Coreum_arkTypeToJsonSchema";
import type { __Coreum_ToJsonSchemaFn } from "./__Coreum_ToJsonSchemaFn";
import { __Coreum_ZodSchemaType } from "./__Coreum_ZodSchemaType";
import { __Coreum_zodToJsonSchema } from "./__Coreum_zodToJsonSchema";

export const __Coreum_ToJsonSchema: __Coreum_ToJsonSchemaFn = (schema) => {
	switch (true) {
		case schema instanceof __Coreum_ArkTypeSchemaType:
			return __Coreum_arkTypeToJsonSchema(schema);
		case schema instanceof __Coreum_ZodSchemaType:
			return __Coreum_zodToJsonSchema(schema);
		default:
			throw new Error("Unsupported parser, currently only zod and ArkType are supported.");
	}
};
