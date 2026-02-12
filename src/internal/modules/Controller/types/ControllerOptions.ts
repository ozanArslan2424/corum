import type { MaybePromise } from "@/internal/utils/MaybePromise";

export type ControllerOptions<Prefix extends string = string> = {
	prefix?: Prefix;
	beforeEach?: <D>(data?: D) => MaybePromise<D> | void;
};
