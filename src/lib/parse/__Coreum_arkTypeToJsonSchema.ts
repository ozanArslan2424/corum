import type { __Coreum_ArkTypeSchemaType } from "@/lib/parse/__Coreum_ArkTypeSchemaType";

export function __Coreum_arkTypeToJsonSchema<Schema extends unknown>(
	schema: __Coreum_ArkTypeSchemaType<Schema>,
): unknown {
	return schema.toJsonSchema({
		target: "draft-2020-12",
		fallback: {
			// ✅ the "default" key is a fallback for any non-explicitly handled code
			// ✅ ctx includes "base" (represents the schema being generated) and other code-specific props
			// ✅ returning `ctx.base` will effectively ignore the incompatible constraint
			default: (ctx) => ctx.base,
			// handle specific incompatibilities granularly
			date: (ctx) => ({
				...ctx.base,
				type: "string",
				format: "date-time",
				description: ctx.after ? `after ${ctx.after}` : "anytime",
			}),
		},
	});
}
