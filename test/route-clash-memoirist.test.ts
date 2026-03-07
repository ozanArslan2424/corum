import { _router, type RouteDefinition } from "@/index";
import { createTestServer } from "./utils/createTestServer";
import C from "@/index";
import { describe, expect, it } from "bun:test";
import { MemoiristAdapter } from "@/Router/adapters/MemoiristAdapter";

// Memoirist doesn't care about some stuff, marked with // ! below
describe("MemoiristAdapter - Route Collision Detection", () => {
	createTestServer({
		adapter: new MemoiristAdapter(),
	});

	function makeRoutes(r1: RouteDefinition, r2: RouteDefinition) {
		try {
			new C.Route(r1, () => "ok");
			new C.Route(r2, () => "ok");
		} catch {
			return "error";
		}
	}

	it("STATIC - IDENTICAL ROUTES SAME METHOD - SHOULD NOT CLASH", () => {
		expect(makeRoutes("/a", "/a")).not.toBe("error");
	});

	it("STATIC - IDENTICAL ROUTES DIFFERENT METHOD - SHOULD NOT CLASH", () => {
		expect(
			makeRoutes(
				{ path: "/b", method: C.Method.GET },
				{ path: "/b", method: C.Method.POST },
			),
		).not.toBe("error");
	});

	it("STATIC - DIFFERENT ROUTES SAME METHOD - SHOULD NOT CLASH", () => {
		expect(makeRoutes("/c", "/d")).not.toBe("error");
	});

	// Param vs Param
	it("DYNAMIC - SAME POSITION DIFFERENT PARAM NAMES - SHOULD CLASH", () => {
		expect(makeRoutes("/e/:a", "/e/:b")).toBe("error");
	});

	// ! NOT ERRORED IN MEMOIRIST
	it("DYNAMIC - IDENTICAL PARAM ROUTES SAME METHOD - SHOULD CLASH", () => {
		expect(makeRoutes("/f/:a", "/f/:a")).not.toBe("error");
	});

	it("DYNAMIC - IDENTICAL PARAM ROUTES DIFFERENT METHOD - SHOULD NOT CLASH", () => {
		expect(
			makeRoutes(
				{ path: "/g/:a", method: C.Method.GET },
				{ path: "/g/:a", method: C.Method.DELETE },
			),
		).not.toBe("error");
	});

	it("DYNAMIC - DIFFERENT BASE PATH - SHOULD NOT CLASH", () => {
		expect(makeRoutes("/h/:a", "/i/:a")).not.toBe("error");
	});

	// Param vs Static
	// ! NOT ERRORED IN MEMOIRIST
	it("DYNAMIC - PARAM BASE WITH EXISTING STATIC - SHOULD CLASH", () => {
		expect(makeRoutes("/j", "/j/:a")).not.toBe("error");
	});

	// ! NOT ERRORED IN MEMOIRIST
	it("STATIC - MAY BE SHADOWED BY EXISTING PARAM ROUTE - SHOULD CLASH", () => {
		expect(makeRoutes("/k/:a", "/k")).not.toBe("error");
	});

	// Nested Param vs Nested Param
	it("DYNAMIC - NESTED SAME STRUCTURE DIFFERENT LAST PARAM NAME - SHOULD CLASH", () => {
		expect(makeRoutes("/l/:a/:b", "/l/:a/:c")).toBe("error");
	});

	it("DYNAMIC - NESTED SAME STRUCTURE DIFFERENT MID PARAM NAME - SHOULD CLASH", () => {
		expect(makeRoutes("/m/:a/:b", "/m/:c/:b")).toBe("error");
	});

	it("DYNAMIC - NESTED DIFFERENT BASE - SHOULD NOT CLASH", () => {
		expect(makeRoutes("/n/:a/:b", "/o/:a/:b")).not.toBe("error");
	});

	// Nested Param vs Nested Static
	// ! NOT ERRORED IN MEMOIRIST
	it("DYNAMIC - NESTED PARAM WITH EXISTING NESTED STATIC - SHOULD CLASH", () => {
		expect(makeRoutes("/p/a", "/p/:a")).not.toBe("error");
	});
});
