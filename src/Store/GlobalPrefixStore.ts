import { StoreAbstract } from "@/Store/StoreAbstract";

export class GlobalPrefixStore extends StoreAbstract<string> {
	protected value = "";
}
