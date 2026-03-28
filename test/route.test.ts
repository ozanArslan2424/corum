import { C } from "@/index";
import { describe, expect, it } from "bun:test";
import { createTestServer } from "./utils/createTestServer";
import { req } from "./utils/req";
import { RouteVariant } from "@/Route/enums/RouteVariant";

const s = createTestServer();

describe("C.Route", () => {
	const handler = async () => "ok";

	it("MAKE ROUTE ID", () => {
		expect(C.Route.makeRouteId("GET", "/test-route-id")).toBe(
			"GET /test-route-id",
		);
		expect(C.Route.makeRouteId("post", "/users-route-id")).toBe(
			"POST /users-route-id",
		);
	});

	it("STRING DEFINITION DEFAULTS TO GET", () => {
		const path = "/r1";
		const route = new C.Route(path, handler);

		expect(route.variant).toBe(RouteVariant.dynamic);
		expect(route.method).toBe(C.Method.GET);
		expect(route.endpoint).toBe(path);
		expect(route.id).toBe(C.Route.makeRouteId(C.Method.GET, path));
	});

	it("OBJECT DEFINITION WITH METHOD", () => {
		const path = "/r2";
		const route = new C.Route({ method: C.Method.POST, path }, handler);

		expect(route.method).toBe(C.Method.POST);
		expect(route.endpoint).toBe(path);
		expect(route.id).toBe(C.Route.makeRouteId(C.Method.POST, path));
	});

	it("REGISTERS TO ROUTER", async () => {
		const path = "/r5";
		new C.Route(path, async () => "registered");

		const res = await s.handle(req(path));
		expect(res.status).toBe(200);
	});

	it("REGISTERS WITH CORRECT METHOD", async () => {
		const path = "/r6";
		new C.Route({ method: C.Method.POST, path }, async () => "posted");

		const res = await s.handle(req(path, { method: "POST" }));
		expect(res.status).toBe(200);
	});

	it("WITH MODEL", () => {
		const path = "/r8";
		const model = { response: undefined, body: undefined };
		const route = new C.Route(path, handler, model);

		expect(route.model).toBe(model);
	});

	it("WITHOUT MODEL", () => {
		const path = "/r9";
		const route = new C.Route(path, handler);

		expect(route.model).toBeUndefined();
	});

	it.each(Object.values(C.Method))("METHOD %s RESOLVES CORRECTLY", (method) => {
		const path = `/${method.toLowerCase()}-method-test`;
		const route = new C.Route({ method, path }, handler);

		expect(route.method).toBe(method);
		expect(route.id).toBe(C.Route.makeRouteId(method, path));
	});
});
