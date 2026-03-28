import { X } from "@/index";
import { describe, expect, it, spyOn } from "bun:test";
import { log } from "@/utils/internalLogger";

describe("X.Config", () => {
	const undefinedKey = "undefined_env_var_key";
	const numberKey = "CONFIG_TEST_NUMBER_VAR_KEY";
	const numberVal = 8;
	const booleanKey = "CONFIG_TEST_BOOLEAN_VAR_KEY";
	const booleanVal = true;
	const key = "CONFIG_TEST_VAR_KEY";
	const val = "CONFIG_TEST_VAR_VALUE";

	it("SET", () => {
		X.Config.set(key, val);
		expect(X.Config.env[key]).toBe(val);
		expect(X.Config.get<string>(key)).toBe(val);
		expect(process.env[key]).toBe(val);
		expect(Bun.env[key]).toBe(val);
	});

	it("NODE_ENV", () => {
		const value = X.Config.nodeEnv;
		expect(value).toBe("test");
		expect(process.env.NODE_ENV === value).toBeTrue();
	});

	it("GET - DEFINED", () => {
		expect(X.Config.get<string>(key)).toBe(val);
	});

	it("GET - DEFINED PARSE NUMBER", () => {
		X.Config.set(numberKey, numberVal);

		expect(X.Config.get(numberKey, { parser: parseInt })).toBe(numberVal);
		expect(X.Config.get(numberKey, { parser: Number })).toBe(numberVal);
	});

	it("GET - DEFINED PARSE BOOLEAN", () => {
		X.Config.set(booleanKey, booleanVal);

		expect(X.Config.get(booleanKey, { parser: (v) => v === "true" })).toBe(
			booleanVal,
		);
		expect(X.Config.get(booleanKey, { parser: Boolean })).toBe(booleanVal);
	});

	it("GET - UNDEFINED", () => {
		const logSpy = spyOn(log, "warn");
		expect(X.Config.get(undefinedKey)).toBeUndefined();
		expect(logSpy).toBeCalled();
	});

	it("GET - UNDEFINED WITH FALLBACK", () => {
		const fallback = "fallback_value";
		expect(X.Config.get(undefinedKey, { fallback })).toBe(fallback);
	});

	it("RUNTIME", () => {
		// The tests are using bun.
		expect(X.Config.runtime).toBe("bun");
	});
});
