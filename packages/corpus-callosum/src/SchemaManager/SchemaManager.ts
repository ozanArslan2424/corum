import type { Config } from "../Config/Config";
import type { ValidationLib } from "../utils/ACCEPTED_VALIDATION_LIBS";
import type { JsonSchema, Schema } from "../utils/Schema";
import { compile } from "json-schema-to-typescript";

import { convertSchema as yupToJsonSchema } from "@sodaru/yup-to-json-schema";
// import { toJsonSchema as valibotToJsonSchema } from "@valibot/to-json-schema";
import z from "zod";

export class SchemaManager {
	constructor(private readonly config: Config) {}

	get options(): Record<string, unknown> {
		return this.config.jsonSchemaOptions;
	}

	toJsonSchema(schema: Schema, lib: ValidationLib): Record<string, unknown> {
		const usedLib = lib ?? schema["~standard"].vendor;
		switch (usedLib) {
			// TODO:
			// case "valibot":
			// 	return valibotToJsonSchema(schema as any, this.options) as Record<
			// 		string,
			// 		unknown
			// 	>;

			case "yup":
				return yupToJsonSchema(schema as any, this.options) as Record<
					string,
					unknown
				>;

			case "zod":
				return z.toJSONSchema(schema as any, {
					target: "draft-07",
					unrepresentable: "any",
					...this.options,
				});

			case "arktype":
			default:
				return (schema as unknown as JsonSchema)["~standard"].jsonSchema.output(
					{
						target: "draft-07",
						...this.options,
					},
				);
		}
	}

	async toInterface(jsonSchema: Record<string, unknown>, name?: string) {
		const schemaType = await compile(
			jsonSchema,
			name ?? "DoesnTMatterWillBeDeleted",
			{
				bannerComment: "",
				format: false,
				ignoreMinAndMaxItems: true,
				additionalProperties: false,
			},
		);

		if (!name) {
			const match = schemaType.match(/\{[\s\S]*\}/);
			if (!match) return schemaType.trim();
			return match[0]
				.replace(/([^{])\n/g, "$1;")
				.replace(/;+/g, ";")
				.replace(/\s+/g, "")
				.replace(/;}/g, "}");
		}

		return schemaType;
	}
}
