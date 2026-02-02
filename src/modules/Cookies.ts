import type { __Coreum_Cookies } from "@/lib/Cookies/__Coreum_Cookies";

/**
 * TODO: Only available in Bun runtime at the moment.
 * Simple cookie map/jar to collect and manipulate cookies. The conversion to
 * Set-Cookie header is handled by {@link Response}
 * */

export const Cookies = __Coreum_Cookies;
export type Cookies = __Coreum_Cookies;
