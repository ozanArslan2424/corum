import type { CRequest } from "@/CRequest/CRequest";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import type { Func } from "@/utils/types/Func";

export interface RouterAdapterInterface {
	find(req: CRequest): RouterReturnData | null;
	add(data: RouterRouteData): void;
	list: Func<[], Array<RouterRouteData>> | undefined;
}
