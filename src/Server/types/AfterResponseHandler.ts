import type { CResponse } from "@/CResponse/CResponse";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type AfterResponseHandler = Func<[CResponse], MaybePromise<CResponse>>;
