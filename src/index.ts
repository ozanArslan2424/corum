import { GlobalPrefixStore } from "@/store/GlobalPrefixStore";
import { GlobalRouterStore } from "@/store/GlobalRouterStore";
import * as C from "@/C";
import * as X from "@/X";

export const $prefixStore = new GlobalPrefixStore();
export const $routerStore = new GlobalRouterStore();

export { BranchAdapter } from "@/Router/adapters/BranchAdapter";
export { MemoiristAdapter } from "@/Router/adapters/MemoiristAdapter";
export type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
export type { RouterReturnData } from "@/Router/types/RouterReturnData";
export type { RouterRouteData } from "@/Router/types/RouterRouteData";

export type * from "./types.d.ts";
export * from "@/C";
export * from "@/X";

export { C, C as Corpus, X, X as Extra };
