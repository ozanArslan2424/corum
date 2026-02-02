import type { __Coreum_ZodSchemaType } from "@/lib/parse/__Coreum_ZodSchemaType";

export function __Coreum_zodToJsonSchema<Schema extends unknown>(
	schema: __Coreum_ZodSchemaType<Schema>,
): unknown {
	return schema.toJSONSchema({
		target: "draft-2020-12",
		unrepresentable: "any",
		override: (ctx) => {
			const def = ctx.zodSchema._zod.def;
			if (def.type === "date") {
				ctx.jsonSchema.type = "string";
				ctx.jsonSchema.format = "date-time";
			}
		},
	});
}
