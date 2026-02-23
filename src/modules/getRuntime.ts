import { RuntimeOptions } from "@/enums/RuntimeOptions";

export function getRuntime() {
	if (typeof Bun !== "undefined") return RuntimeOptions.bun;
	return RuntimeOptions.node;
}
