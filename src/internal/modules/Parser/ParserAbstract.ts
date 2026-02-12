import { makeLogger } from "@/internal/modules/Logger/LoggerClass";
import type { ParserInterface } from "@/internal/modules/Parser/ParserInterface";
import type { SchemaType } from "@/internal/modules/Parser/types/SchemaType";

export abstract class ParserAbstract implements ParserInterface {
	protected readonly logger = makeLogger("Parser");

	abstract parse<O>(
		data: unknown,
		schema: SchemaType<O>,
		errorMessage: string,
	): O;
	abstract toJsonSchema(schema: SchemaType): Record<string, unknown>;
}
