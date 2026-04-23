import { BodyParser } from "@/Parser/BodyParser";
import { FormDataParser } from "@/Parser/FormDataParser";
import { parseSchema } from "@/Parser/parseSchema";
import { SearchParamsParser } from "@/Parser/SearchParamsParser";
import type { Req } from "@/Req/Req";
import type { Res } from "@/Res/Res";

export async function parseBody<T>(r: Req | Res | Response): Promise<T> {
	const searchParamsParser = new SearchParamsParser();
	const formDataParser = new FormDataParser();
	const bodyParser = new BodyParser(formDataParser, searchParamsParser);

	const body = await bodyParser.parse(r);
	return await parseSchema<T>("body", body);
}
