import { _router, type RouteDefinition } from "@/index";
import { createTestServer } from "./utils/createTestServer";
import C from "@/index";
import { beforeEach, describe, expect, it, spyOn } from "bun:test";

describe("CorpusAdapter - Route Collision Detection", () => {
	createTestServer();
	const errorSpy = spyOn(console, "error");
	beforeEach(() => errorSpy.mockReset());

	function makeRoutes(r1: RouteDefinition, r2: RouteDefinition) {
		new C.Route(r1, () => "ok");
		new C.Route(r2, () => "ok");
	}

	// Static vs Static
	it("STATIC - IDENTICAL ROUTES SAME METHOD - SHOULD CLASH", () => {
		makeRoutes("/a", "/a");
		expect(errorSpy).toBeCalled();
	});

	it("STATIC - IDENTICAL ROUTES DIFFERENT METHOD - SHOULD NOT CLASH", () => {
		makeRoutes(
			{ path: "/b", method: C.Method.GET },
			{ path: "/b", method: C.Method.POST },
		);
		expect(errorSpy).not.toBeCalled();
	});

	it("STATIC - DIFFERENT ROUTES SAME METHOD - SHOULD NOT CLASH", () => {
		makeRoutes("/c", "/d");
		expect(errorSpy).not.toBeCalled();
	});

	// Param vs Param
	it("DYNAMIC - SAME POSITION DIFFERENT PARAM NAMES - SHOULD CLASH", () => {
		makeRoutes("/e/:a", "/e/:b");
		expect(errorSpy).toBeCalled();
	});

	it("DYNAMIC - IDENTICAL PARAM ROUTES SAME METHOD - SHOULD CLASH", () => {
		makeRoutes("/f/:a", "/f/:a");
		expect(errorSpy).toBeCalled();
	});

	it("DYNAMIC - IDENTICAL PARAM ROUTES DIFFERENT METHOD - SHOULD NOT CLASH", () => {
		makeRoutes(
			{ path: "/g/:a", method: C.Method.GET },
			{ path: "/g/:a", method: C.Method.DELETE },
		);
		expect(errorSpy).not.toBeCalled();
	});

	it("DYNAMIC - DIFFERENT BASE PATH - SHOULD NOT CLASH", () => {
		makeRoutes("/h/:a", "/i/:a");
		expect(errorSpy).not.toBeCalled();
	});

	// Param vs Static
	it("DYNAMIC - PARAM BASE WITH EXISTING STATIC - SHOULD CLASH", () => {
		makeRoutes("/j", "/j/:a");
		expect(errorSpy).toBeCalled();
	});

	it("STATIC - MAY BE SHADOWED BY EXISTING PARAM ROUTE - SHOULD CLASH", () => {
		makeRoutes("/k/:a", "/k");
		expect(errorSpy).toBeCalled();
	});

	// Nested Param vs Nested Param
	it("DYNAMIC - NESTED SAME STRUCTURE DIFFERENT LAST PARAM NAME - SHOULD CLASH", () => {
		makeRoutes("/l/:a/:b", "/l/:a/:c");
		expect(errorSpy).toBeCalled();
	});

	it("DYNAMIC - NESTED SAME STRUCTURE DIFFERENT MID PARAM NAME - SHOULD CLASH", () => {
		makeRoutes("/m/:a/:b", "/m/:c/:b");
		expect(errorSpy).toBeCalled();
	});

	it("DYNAMIC - NESTED DIFFERENT BASE - SHOULD NOT CLASH", () => {
		makeRoutes("/n/:a/:b", "/o/:a/:b");
		expect(errorSpy).not.toBeCalled();
	});

	// Nested Param vs Nested Static
	it("DYNAMIC - NESTED PARAM WITH EXISTING NESTED STATIC - SHOULD CLASH", () => {
		makeRoutes("/p/a", "/p/:a");
		expect(errorSpy).toBeCalled();
	});
});
