export class RegistryStore<T> {
	constructor(private readonly initialValue: T) {
		this.value = initialValue;
	}

	value: T;

	get() {
		return this.value;
	}

	set(value: T) {
		this.value = value;
		this.reset = () => {
			console.log("resetting to ", value);
			this.value = value;
		};
	}

	reset = () => {
		this.clear();
	};

	clear() {
		console.log("resetting to ", this.initialValue);
		this.value = this.initialValue;
	}
}
