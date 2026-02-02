import type { __Coreum_Middleware } from "@/lib/Middleware/__Coreum_Middleware";

/**
 * Simple middleware that runs before the Route "callback" parameters.
 * can return data for {@link Context.data}
 * */

export const Middleware = __Coreum_Middleware;
export type Middleware<D = void> = __Coreum_Middleware<D>;
