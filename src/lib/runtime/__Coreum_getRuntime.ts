import { __Coreum_Config } from "@/lib/Config/__Coreum_Config";
import { __Coreum_runtimeEnvKey } from "@/lib/runtime/__Coreum_runtimeEnvKey";
import { __Coreum_RuntimeOptions } from "@/lib/runtime/__Coreum_RuntimeOptions";

export function __Coreum_getRuntime() {
	return __Coreum_Config.get<__Coreum_RuntimeOptions>(__Coreum_runtimeEnvKey, {
		fallback: __Coreum_RuntimeOptions.bun,
	});
}
