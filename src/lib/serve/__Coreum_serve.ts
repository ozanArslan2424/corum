import { __Coreum_serveBun } from "@/lib/serve/__Coreum_serveBun";
import { __Coreum_getRuntime } from "@/lib/runtime/__Coreum_getRuntime";
import { __Coreum_serveNodeHTTP } from "@/lib/serve/__Coreum_serveNodeHTTP";
import type { __Coreum_ServeFn } from "./__Coreum_ServeFn";

export const __Coreum_serve: __Coreum_ServeFn = (options) => {
	const runtime = __Coreum_getRuntime();

	switch (runtime) {
		case "bun":
			return __Coreum_serveBun(options);
		case "node":
			return __Coreum_serveNodeHTTP(options);
		default:
			throw new Error(`Unsupported runtime: ${runtime}`);
	}
};
