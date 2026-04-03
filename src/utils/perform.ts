import type { Func } from "@/utils/types/Func";

export async function perform<F extends Func>(
	fn: F,
	name?: string,
): Promise<ReturnType<F>> {
	const start = performance.now();

	const result = await fn();

	const end = performance.now();
	const startup = end - start;
	console.log(`🚀 ${name ?? fn.name} function took ${startup.toFixed(2)}ms`);

	return result;
}
