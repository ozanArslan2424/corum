import { $registryTesting, TC } from "./_modules";
import { afterEach, describe, expect, it } from "bun:test";

afterEach(() => $registryTesting.reset());

describe("C.Headers", () => {
	const authHeader = TC.CommonHeaders.Authorization;
	const authValue = "Bearer 1827381273";
	const contHeader = TC.CommonHeaders.ContentType;
	const contValue = "application/json";

	function expectMethods(
		headers: TC.Headers,
		count: number = 1,
		value: string = authValue,
		obj: Record<string, string> = { [authHeader.toLowerCase()]: authValue },
	) {
		expect(headers.count).toBe(count);
		expect(headers.get(authHeader)).toBe(value);
		expect(headers.has(authHeader)).toBeTrue();
		expect(headers.toJSON()).toEqual(obj);
		headers.delete(authHeader);
		expect(headers.count).toBe(count - 1);
		expect(headers.get(authHeader)).toBeNull();
		expect(headers.has(authHeader)).toBeFalse();
		if (count - 1 === 0) {
			expect(headers.toJSON()).toBeEmptyObject();
		}
		// No need to overcomplicate by adding an else statement,
		// this is just for method testing
	}

	it("INIT - OBJECT", () => {
		const headers = new TC.Headers({ [authHeader]: authValue });
		expectMethods(headers);
	});

	it("INIT - TUPLE ARRAY", () => {
		const headers = new TC.Headers([[authHeader, authValue]]);
		expectMethods(headers);
	});

	it("INIT - C.HEADERS - INNER INIT OBJECT", () => {
		const headers = new TC.Headers(new TC.Headers({ [authHeader]: authValue }));
		expectMethods(headers);
	});

	it("INIT - C.HEADERS - INNER INIT TUPLE ARRAY", () => {
		const headers = new TC.Headers(new TC.Headers([[authHeader, authValue]]));
		expectMethods(headers);
	});

	it("INIT - HEADERS - INNER INIT OBJECT", () => {
		const headers = new TC.Headers(new Headers({ [authHeader]: authValue }));
		expectMethods(headers);
	});

	it("INIT - HEADERS - INNER INIT TUPLE ARRAY", () => {
		const headers = new TC.Headers(new Headers([[authHeader, authValue]]));
		expectMethods(headers);
	});

	it("SET", () => {
		const headers = new TC.Headers();
		headers.set(authHeader, authValue);
		expectMethods(headers);
	});

	it("APPEND - EMPTY", () => {
		const headers = new TC.Headers();
		headers.append(authHeader, authValue);
		expectMethods(headers);
	});

	it("APPEND - EXISTING", () => {
		const initialValue = "initial value";
		const expectedValue = `${initialValue}, ${authValue}`;
		const headers = new TC.Headers();
		headers.set(authHeader, initialValue);
		headers.append(authHeader, authValue);
		expectMethods(headers, 1, expectedValue, {
			[authHeader.toLowerCase()]: expectedValue,
		});
	});

	it("SETMANY - OBJECT INIT", () => {
		const headers = new TC.Headers();
		headers.setMany({
			[authHeader]: authValue,
			[contHeader]: contValue,
		});
		expectMethods(headers, 2, authValue, {
			[authHeader.toLowerCase()]: authValue,
			[contHeader.toLowerCase()]: contValue,
		});
	});

	it("SETMANY - TUPLE ARRAY INIT", () => {
		const headers = new TC.Headers();
		headers.setMany([
			[authHeader, authValue],
			[contHeader, contValue],
		]);
		expectMethods(headers, 2, authValue, {
			[authHeader.toLowerCase()]: authValue,
			[contHeader.toLowerCase()]: contValue,
		});
	});

	it("COMBINE - WITH EMPTY", () => {
		const source = new TC.Headers({ [authHeader]: authValue });
		const target = new TC.Headers();
		const combined = TC.Headers.combine(source, target);
		expectMethods(combined);
	});

	it("COMBINE - WITH ADDITION", () => {
		const source = new TC.Headers({ [authHeader]: authValue });
		const target = new TC.Headers({ [contHeader]: contValue });
		const combined = TC.Headers.combine(source, target);
		expectMethods(combined, 2, authValue, {
			[authHeader.toLowerCase()]: authValue,
			[contHeader.toLowerCase()]: contValue,
		});
	});

	const overrideValue = "override";

	it("COMBINE - WITH OVERRIDE", () => {
		const source = new TC.Headers({ [authHeader]: overrideValue });
		const target = new TC.Headers({ [authHeader]: authValue });
		const combined = TC.Headers.combine(source, target);
		expectMethods(combined, 1, overrideValue, {
			[authHeader.toLowerCase()]: overrideValue,
		});
	});

	it("INNERCOMBINE - WITH EMPTY", () => {
		const source = new TC.Headers({ [authHeader]: authValue });
		const target = new TC.Headers();
		target.innerCombine(source);
		expectMethods(target);
	});

	it("INNERCOMBINE - WITH ADDITION", () => {
		const source = new TC.Headers({ [authHeader]: authValue });
		const target = new TC.Headers({ [contHeader]: contValue });
		target.innerCombine(source);
		expectMethods(target, 2, authValue, {
			[authHeader.toLowerCase()]: authValue,
			[contHeader.toLowerCase()]: contValue,
		});
	});

	it("INNERCOMBINE - WITH OVERRIDE", () => {
		const source = new TC.Headers({ [authHeader]: overrideValue });
		const target = new TC.Headers({ [authHeader]: authValue });
		target.innerCombine(source);
		expectMethods(target, 1, overrideValue, {
			[authHeader.toLowerCase()]: overrideValue,
		});
	});

	it("SET - NUMBER VALUE", () => {
		const headers = new TC.Headers();
		headers.set(authHeader, 42);
		expect(headers.get(authHeader)).toBe("42");
	});

	it("SET - BOOLEAN VALUE", () => {
		const headers = new TC.Headers();
		headers.set(authHeader, true);
		expect(headers.get(authHeader)).toBe("true");
	});

	it("APPEND - ARRAY VALUE", () => {
		const headers = new TC.Headers();
		headers.append(authHeader, ["value1", "value2"]);
		const result = headers.get(authHeader);
		expect(result).toContain("value1");
		expect(result).toContain("value2");
	});

	it("GET - CASE INSENSITIVE", () => {
		const headers = new TC.Headers();
		headers.set(authHeader, authValue);
		expect(headers.get(authHeader.toLowerCase() as any)).toBe(authValue);
		expect(headers.get(authHeader.toUpperCase() as any)).toBe(authValue);
	});

	it("HAS - CASE INSENSITIVE", () => {
		const headers = new TC.Headers();
		headers.set(authHeader, authValue);
		expect(headers.has(authHeader.toLowerCase() as any)).toBeTrue();
		expect(headers.has(authHeader.toUpperCase() as any)).toBeTrue();
	});

	it("COUNT - EMPTY", () => {
		const headers = new TC.Headers();
		expect(headers.count).toBe(0);
	});

	it("COUNT - MULTIPLE", () => {
		const headers = new TC.Headers({
			[authHeader]: authValue,
			[contHeader]: contValue,
		});
		expect(headers.count).toBe(2);
	});

	it("TOJSON - EMPTY", () => {
		const headers = new TC.Headers();
		expect(headers.toJSON()).toBeEmptyObject();
	});

	it("TOJSON - MULTIPLE", () => {
		const headers = new TC.Headers({
			[authHeader]: authValue,
			[contHeader]: contValue,
		});
		expect(headers.toJSON()).toEqual({
			[authHeader.toLowerCase()]: authValue,
			[contHeader.toLowerCase()]: contValue,
		});
	});

	it("SETMANY - SKIPS UNDEFINED VALUES", () => {
		const headers = new TC.Headers();
		headers.setMany({
			[authHeader]: authValue,
			[contHeader]: undefined as any,
		});
		expect(headers.count).toBe(1);
		expect(headers.has(contHeader)).toBeFalse();
	});

	it("COMBINE - SOURCE WINS ON CONFLICT", () => {
		const source = new TC.Headers({ [authHeader]: "source-value" });
		const target = new TC.Headers({ [authHeader]: "target-value" });
		const combined = TC.Headers.combine(source, target);
		expect(combined.get(authHeader)).toBe("source-value");
	});

	it("COMBINE - SET-COOKIE APPENDS INSTEAD OF OVERWRITING", () => {
		const source = new TC.Headers({ "Set-Cookie": "a=1" });
		const target = new TC.Headers({ "Set-Cookie": "b=2" });
		TC.Headers.combine(source, target);
		const result = target.get("Set-Cookie");
		expect(result).toContain("a=1");
	});
});
