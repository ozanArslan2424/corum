import { __Coreum_getRuntime } from "@/lib/runtime/__Coreum_getRuntime";
import { __Coreum_setRuntime } from "@/lib/runtime/__Coreum_setRuntime";

/**
 * This function sets the runtime to either "bun" or "node", it defaults to "bun".
 * Some features are only available in "bun".
 * */

export const setRuntime = __Coreum_setRuntime;
export const getRuntime = __Coreum_getRuntime;
