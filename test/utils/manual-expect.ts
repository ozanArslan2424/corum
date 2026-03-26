export function manualExpect(actual: any) {
	function stringify(input: any) {
		if (Array.isArray(input)) {
			return JSON.stringify(input.sort());
		} else {
			return JSON.stringify(input);
		}
	}

	return {
		toHaveProperty(key: string, value?: any) {
			if (!(key in actual)) {
				throw new Error(`Expected object to have property "${key}"`);
			}
			if (value !== undefined && actual[key] !== value) {
				throw new Error(
					`Expected property "${key}" to be ${value}, got ${actual[key]}`,
				);
			}
		},
		toEqual(expected: any) {
			if (stringify(actual) !== stringify(expected)) {
				throw new Error(
					`Expected ${stringify(actual)} to equal ${stringify(expected)}`,
				);
			}
		},
		toBeGreaterThan(expected: number) {
			if (actual <= expected) {
				throw new Error(`Expected ${actual} to be greater than ${expected}`);
			}
		},
		toContain(expected: any) {
			if (!actual.includes(expected)) {
				throw new Error(`Expected ${stringify(actual)} to contain ${expected}`);
			}
		},
		toHaveLength(expected: number) {
			if (actual.length !== expected) {
				throw new Error(`Expected length ${expected}, got ${actual.length}`);
			}
		},
	};
}
