import { __Coreum_arkTypeParse } from "./__Coreum_arkTypeParse";
import { __Coreum_ArkTypeSchemaType } from "./__Coreum_ArkTypeSchemaType";
import type { __Coreum_ParseFn } from "./__Coreum_ParseFn";
import { __Coreum_zodParse } from "./__Coreum_zodParse";
import { __Coreum_ZodSchemaType } from "./__Coreum_ZodSchemaType";

export const __Coreum_Parse: __Coreum_ParseFn = (data, schema, errorMessage) => {
	switch (true) {
		case schema instanceof __Coreum_ArkTypeSchemaType:
			return __Coreum_arkTypeParse(data, schema, errorMessage);
		case schema instanceof __Coreum_ZodSchemaType:
			return __Coreum_zodParse(data, schema, errorMessage);
		default:
			throw new Error("Unsupported parser, currently only zod and ArkType are supported.");
	}
};
