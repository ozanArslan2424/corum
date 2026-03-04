import type { Func } from "@/utils/types/Func";

export type ConfigValueParser<T> = Func<[string], T>;
