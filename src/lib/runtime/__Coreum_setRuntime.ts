import { __Coreum_Config } from "@/lib/Config/__Coreum_Config";
import { __Coreum_runtimeEnvKey } from "@/lib/runtime/__Coreum_runtimeEnvKey";
import type { __Coreum_RuntimeOptions } from "@/lib/runtime/__Coreum_RuntimeOptions";

export function __Coreum_setRuntime(value: __Coreum_RuntimeOptions) {
	return __Coreum_Config.set(__Coreum_runtimeEnvKey, value);
}
