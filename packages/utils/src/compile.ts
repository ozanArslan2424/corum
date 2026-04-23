import type { Func } from "./Func";
import type { MaybePromise } from "./MaybePromise";

export function compile<F extends Func>(
	fns: Array<F | undefined>,
): Func<Parameters<F>, MaybePromise<Awaited<ReturnType<F>> | void>> {
	return async (...args) => {
		for (const fn of fns) {
			if (!fn) continue;
			const result = await fn(...args);
			if (result !== undefined) return result;
		}
	};
}
