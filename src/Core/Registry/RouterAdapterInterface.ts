import type { CRequest } from "@/Core/CRequest/CRequest";
import type { RouterReturn } from "@/Core/Registry/RouterReturn";
import type { RouterData } from "@/Core/Registry/RouterData";
import type { Func } from "@/Utils/Func";
import type { Branded } from "@/Utils/Branded";

export interface RouterAdapterInterface extends Branded<{
	find(req: CRequest): RouterReturn | null;
	add(data: RouterData): void;
	list: Func<[], Array<RouterData>> | undefined;
}> {}
