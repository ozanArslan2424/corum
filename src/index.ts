import { GlobalPrefixStore } from "@/Store/GlobalPrefixStore";
import { GlobalRouterStore } from "@/Store/GlobalRouterStore";
import * as C from "@/C";
import * as X from "@/X";

export { BranchAdapter } from "@/Router/adapters/BranchAdapter";
export { MemoiristAdapter } from "@/Router/adapters/MemoiristAdapter";
export type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
export type { RouterReturnData } from "@/Router/types/RouterReturnData";
export type { RouterRouteData } from "@/Router/types/RouterRouteData";

export const $prefixStore = new GlobalPrefixStore();
export const $routerStore = new GlobalRouterStore();

export type * from "./types.d.ts";
export * from "@/C";
export * from "@/X";

export { C, C as Corpus, X, X as Extra };
