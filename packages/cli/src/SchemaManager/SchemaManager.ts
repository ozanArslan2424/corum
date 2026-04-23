import { convertSchema as yupToJsonSchema } from "@sodaru/yup-to-json-schema";
import type { Type } from "arktype";
import { compile } from "json-schema-to-typescript";
import { ZodType } from "zod";

import type { Config } from "../Config/Config";
import type { Schema } from "../utils/Schema";
// TODO:
// import { toJsonSchema as valibotToJsonSchema } from "@valibot/to-json-schema";

export class SchemaManager {
	constructor(private readonly config: Config) {}

	get options(): Record<string, unknown> {
		return this.config.jsonSchemaOptions;
	}

	toJsonSchema(schema: Schema): Record<string, unknown> {
		const vendor = schema["~standard"].vendor;
		switch (vendor) {
			case "yup":
				return yupToJsonSchema(schema as any, this.options) as Record<string, unknown>;

			case "zod":
				return (schema as ZodType).toJSONSchema({
					target: "draft-07",
					unrepresentable: "any",
					...this.options,
				});

			case "arktype":
			default:
				return (schema as Type).toJsonSchema({
					target: "draft-07",
					...this.options,
				}) as Record<string, unknown>;
		}
	}

	async toInterface(jsonSchema: Record<string, unknown>, name?: string) {
		const schemaType = await compile(jsonSchema, name ?? "DoesnTMatterWillBeDeleted", {
			bannerComment: "",
			format: false,
			ignoreMinAndMaxItems: true,
			additionalProperties: false,
		});

		if (!name) {
			return schemaType
				.replace("export ", "")
				.replace("type DoesnTMatterWillBeDeleted = ", "")
				.replace("interface DoesnTMatterWillBeDeleted", "")
				.trim();
		}

		return schemaType;
	}
}
