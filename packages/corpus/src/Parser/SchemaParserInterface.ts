import type { SchemaValidator } from "corpus-utils/Schema";
import type { UnknownObject } from "corpus-utils/UnknownObject";

export interface SchemaParserInterface {
	parse<T = UnknownObject>(label: string, data: unknown, validate?: SchemaValidator<T>): Promise<T>;
	parseSync<T = UnknownObject>(label: string, data: unknown, validate?: SchemaValidator<T>): T;
}
