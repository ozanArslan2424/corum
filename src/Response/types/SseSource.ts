import type { SseData } from "@/Response/types/SseData";
import type { Func } from "@/utils/types/Func";

export type SseSource = Func<
	[send: Func<[event: SseData], void>],
	void | Func<[], void>
>;
