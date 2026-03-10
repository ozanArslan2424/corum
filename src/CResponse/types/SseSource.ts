import type { SseData } from "@/CResponse/types/SseData";
import type { Func } from "@/utils/types/Func";

export type SseSource = Func<
	[send: Func<[event: SseData], void>],
	void | Func<[], void>
>;
