import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type ControllerOptions = {
	prefix?: string;
	beforeEach?: Func<[context: Context], MaybePromise<void>>;
};
