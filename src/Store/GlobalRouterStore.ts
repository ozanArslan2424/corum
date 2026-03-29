import type { Router } from "@/Router/Router";
import { StoreAbstract } from "@/Store/StoreAbstract";
import { logFatal } from "@/utils/internalLogger";

export class GlobalRouterStore extends StoreAbstract<Router | null> {
	value: Router | null = null;

	override get(): Router {
		if (!this.value) {
			logFatal(
				"Router instance is not set. Please instantiate your Server before your routes.",
			);
		}
		return this.value;
	}
}
