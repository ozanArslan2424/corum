import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export function compile<F extends Func>(
	fns: (F | undefined)[],
): Func<Parameters<F>, MaybePromise<void>> {
	return async (...args: Parameters<F>) => {
		for (const fn of fns) {
			if (!fn) continue;
			await fn(...args);
		}
	};
}
