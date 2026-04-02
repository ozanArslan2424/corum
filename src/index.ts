import { Router } from "@/Router/Router";
import { Store } from "@/utils/Store";

import * as C from "@/C";
import * as X from "@/X";

export { BranchAdapter } from "@/Router/adapters/BranchAdapter";
export { MemoiristAdapter } from "@/Router/adapters/MemoiristAdapter";
export type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
export type { RouterReturnData } from "@/Router/types/RouterReturnData";
export type { RouterRouteData } from "@/Router/types/RouterRouteData";

export const $prefixStore = new Store("");
export const $routerStore = new Store(new Router());
export const $corsStore = new Store<X.Cors | null>(null);

export type * from "./types.d.ts";
export * from "@/C";
export * from "@/X";

export { C, C as Corpus, X, X as Extra };
