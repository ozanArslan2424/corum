import type { Func } from "corpus-utils/Func";

export type NdjsonSource = Func<[send: Func<[item: unknown], void>], void | Func<[], void>>;
