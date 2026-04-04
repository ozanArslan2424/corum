import type { Func } from "@/Utils/Func";
import type { MaybePromise } from "@/Utils/MaybePromise";

export function compile<F extends Func>(
	fns: Array<F | undefined>,
): Func<Parameters<F>, MaybePromise<Awaited<ReturnType<F>> | void>> {
	return async (...args: Parameters<F>) => {
		for (const fn of fns) {
			if (!fn) continue;
			const result = await fn(...args);
			if (result !== undefined) return result;
		}
	};
}
