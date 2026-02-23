import type { Context } from "@/modules/Context";
import type { MaybePromise } from "@/types/MaybePromise";

export type ControllerOptions = {
	prefix?: string;
	beforeEach?: (context: Context) => MaybePromise<void>;
};
