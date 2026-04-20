import * as C from "./C";
import { Registry } from "./Registry/Registry";
import * as X from "./X";

export const $registry = new Registry();

export type * from "./types.d.ts";
export * from "./C";
export * from "./X";

export { C, C as Corpus, X, X as Extra };
