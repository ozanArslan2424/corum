import type { Func } from "corpus-utils/Func";

import type { Branded } from "@/Branding/Branded";
import type { RouterData } from "@/Registry/RouterData";
import type { RouterReturn } from "@/Registry/RouterReturn";
import type { Req } from "@/Req/Req";

export interface RouterAdapterInterface extends Branded<{
	find(req: Req): RouterReturn | null;
	add(data: RouterData): void;
	list: Func<[], Array<RouterData>> | undefined;
}> {}
