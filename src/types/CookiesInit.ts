import type { Cookies } from "@/modules/Cookies";

export type CookiesInit = Cookies | [string, string][] | Record<string, string>;
