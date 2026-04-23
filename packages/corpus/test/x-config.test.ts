import { beforeEach, describe, expect, it, spyOn } from "bun:test";

import { $registryTesting, TX } from "./_modules";

beforeEach(() => $registryTesting.reset());

describe("X.Config", () => {
	const undefinedKey = "undefined_env_var_key";
	const numberKey = "CONFIG_TEST_NUMBER_VAR_KEY";
	const numberVal = 8;
	const booleanKey = "CONFIG_TEST_BOOLEAN_VAR_KEY";
	const booleanVal = true;
	const key = "CONFIG_TEST_VAR_KEY";
	const val = "CONFIG_TEST_VAR_VALUE";

	it("SET", () => {
		TX.Config.set(key, val);
		expect(TX.Config.env[key]).toBe(val);
		expect(TX.Config.get<typeof val>(key)).toBe(val);
		expect(process.env[key]).toBe(val);
		expect(Bun.env[key]).toBe(val);
	});

	it("NODE_ENV", () => {
		const value = TX.Config.nodeEnv;
		expect(value).toBe("test");
		expect(process.env.NODE_ENV === value).toBeTrue();
	});

	it("GET - DEFINED", () => {
		expect(TX.Config.get<typeof val>(key)).toBe(val);
	});

	it("GET - DEFINED PARSE NUMBER", () => {
		TX.Config.set(numberKey, numberVal);

		expect(TX.Config.get(numberKey, { parser: parseInt })).toBe(numberVal);
		expect(TX.Config.get(numberKey, { parser: Number })).toBe(numberVal);
	});

	it("GET - DEFINED PARSE BOOLEAN", () => {
		TX.Config.set(booleanKey, booleanVal);

		expect(TX.Config.get(booleanKey, { parser: (v) => v === "true" })).toBe(booleanVal);
		expect(TX.Config.get(booleanKey, { parser: Boolean })).toBe(booleanVal);
	});

	it("GET - UNDEFINED", () => {
		const logSpy = spyOn(console, "warn");
		expect(TX.Config.get(undefinedKey)).toBeUndefined();
		expect(logSpy).toBeCalled();
		logSpy.mockClear();
	});

	it("GET - UNDEFINED WITH FALLBACK", () => {
		const fallback = "fallback_value";
		expect(TX.Config.get(undefinedKey, { fallback })).toBe(fallback);
	});

	it("RUNTIME", () => {
		// The tests are using bun.
		expect(TX.Config.runtime).toBe("bun");
	});
});
