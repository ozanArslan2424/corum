import { log } from "@/Utils/log";

export type Func<Args extends any[] = any[], Return = any> = (
	...args: Args
) => Return;

export namespace Func {
	export function time<F extends Func>(name: string, fn: F): F {
		return function (...args) {
			const start = performance.now();
			const result = fn(...args);
			const end = performance.now();
			const elapsed = end - start;

			if (elapsed > 50) {
				log.log(`\x1b[33m${name} took ${(elapsed / 1000).toFixed(1)}s\x1b[0m`);
			}

			return result;
		} as F;
	}

	export function timeReturn<F extends Func>(
		name: string,
		fn: F,
	): ReturnType<F> {
		return time(name, fn)();
	}
}
