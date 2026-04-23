import type { UnknownObject } from "corpus-utils/UnknownObject";

import { ObjectParserAbstract } from "@/Parser/ObjectParserAbstract";

export class URLParamsParser extends ObjectParserAbstract<Record<string, string>> {
	toObject(input: Record<string, string>): UnknownObject {
		const data: UnknownObject = {};
		for (const [key, value] of Object.entries(input)) {
			data[key] = this.tryParseJSON(decodeURIComponent(value));
		}
		return data;
	}
}
