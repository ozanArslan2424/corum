import type { SchemaValidator } from "corpus-utils/Schema";
import type { UnknownObject } from "corpus-utils/UnknownObject";

import { BodyParser } from "@/Parser/BodyParser";
import { FormDataParser } from "@/Parser/FormDataParser";
import { SchemaParser } from "@/Parser/SchemaParser";
import { SearchParamsParser } from "@/Parser/SearchParamsParser";
import type { Req } from "@/Req/Req";
import type { Res } from "@/Res/Res";

export class Parser {
	static readonly formDataParser = new FormDataParser();
	static readonly searchParamsParser = new SearchParamsParser();
	static readonly bodyParser = new BodyParser();
	static readonly schemaParser = new SchemaParser();

	static async parseBody<T = UnknownObject>(
		r: Req | Res | Response,
		validate?: SchemaValidator<T>,
	): Promise<T> {
		const data = await this.bodyParser.parse(r);
		return await this.schemaParser.parse("body", data, validate);
	}

	static async parseSearchParams<T = UnknownObject>(
		searchParams: URLSearchParams,
		validate?: SchemaValidator<T>,
	): Promise<T> {
		const data = this.searchParamsParser.toObject(searchParams);
		return await this.schemaParser.parse("URLSearchParams", data, validate);
	}

	static async parseUrlParams<T = UnknownObject>(
		urlParams: Record<string, string>,
		validate?: SchemaValidator<T>,
	): Promise<T> {
		const data: UnknownObject = {};
		for (const [key, value] of Object.entries(urlParams)) {
			data[key] = decodeURIComponent(value);
		}
		return await this.schemaParser.parse("params", data, validate);
	}
}
