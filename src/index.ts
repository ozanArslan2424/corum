import type { Router } from "@/modules/Router";

let RouterInstance: Router;

export function getRouterInstance(): Router {
	if (!RouterInstance) {
		console.error(
			"Router instance is not set. Please instantiate your Server before your routes.",
		);
		process.exit(1);
	}
	return RouterInstance;
}

export function setRouterInstance(router: Router): void {
	RouterInstance = router;
}

export type * from "@/types.d.ts";

import * as C from "@/exports";

export * from "@/exports";

export { C };

export default C;
