import type { Func } from "@/Utils/Func";

export class Store<T> {
	constructor(protected readonly init: T) {
		this.value = init;
	}

	protected value: T;

	set(value: T) {
		this.make = () => value;
		this.value = value;
	}

	get(): T {
		return this.value;
	}

	make: Func<[], T> = () => this.init;

	remake(): void {
		this.value = this.make();
	}

	reset(): void {
		this.value = this.init;
	}
}
