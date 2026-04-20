import { TC } from "../_modules";

export async function parseBody<T>(r: TC.Req | TC.Res | Response): Promise<T> {
	return await TC.Parser.parseBody<T>(r);
}
