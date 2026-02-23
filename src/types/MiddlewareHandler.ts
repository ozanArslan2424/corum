import type { Context } from "@/modules/Context";
import type { MaybePromise } from "@/types/MaybePromise";

export type MiddlewareHandler = (context: Context) => MaybePromise<void>;
