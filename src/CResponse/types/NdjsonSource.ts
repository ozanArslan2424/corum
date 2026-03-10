import type { Func } from "@/utils/types/Func";

export type NdjsonSource = Func<
	[send: Func<[item: unknown], void>],
	void | Func<[], void>
>;
