import { log } from "@/Utils/log";
import type { Func } from "@/Utils/Func";

export async function perform<F extends Func>(
	fn: F,
	name?: string,
): Promise<ReturnType<F>> {
	const start = performance.now();

	const result = await fn();

	const end = performance.now();
	const startup = end - start;

	const msg = `🚀 ${name ?? fn.name ?? "function"} took ${startup.toFixed(2)}ms`;

	if (startup > 10) {
		log.warn(msg);
	} else if (startup > 20) {
		log.error(msg);
	} else {
		log.log(msg);
	}

	return result;
}
