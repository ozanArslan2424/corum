import { $registryTesting, TC } from "./_modules";
import { afterEach, describe, expect, it } from "bun:test";
import { createTestServer } from "./utils/createTestServer";
import { req } from "./utils/req";

afterEach(() => $registryTesting.reset());

const s = createTestServer();

describe("C.Route", () => {
	const handler = async () => "ok";

	it("STRING DEFINITION DEFAULTS TO GET", () => {
		const path = "/r1";
		const route = new TC.Route(path, handler);

		expect(route.variant).toBe("dynamic");
		expect(route.method).toBe(TC.Method.GET);
		expect(route.endpoint).toBe(path);
		expect(route.id).toBe(`${TC.Method.GET} ${path}`);
	});

	it("OBJECT DEFINITION WITH METHOD", () => {
		const path = "/r2";
		const route = new TC.Route({ method: TC.Method.POST, path }, handler);

		expect(route.method).toBe(TC.Method.POST);
		expect(route.endpoint).toBe(path);
		expect(route.id).toBe(`${TC.Method.POST} ${path}`);
	});

	it("REGISTERS TO ROUTER", async () => {
		const path = "/r5";
		new TC.Route(path, async () => "registered");

		const res = await s.handle(req(path));
		expect(res.status).toBe(200);
	});

	it("REGISTERS WITH CORRECT METHOD", async () => {
		const path = "/r6";
		new TC.Route({ method: TC.Method.POST, path }, async () => "posted");

		const res = await s.handle(req(path, { method: "POST" }));
		expect(res.status).toBe(200);
	});

	it("WITH MODEL", () => {
		const path = "/r8";
		const model = { response: undefined, body: undefined };
		const route = new TC.Route(path, handler, model);

		expect(route.model).toBe(model);
	});

	it("WITHOUT MODEL", () => {
		const path = "/r9";
		const route = new TC.Route(path, handler);

		expect(route.model).toBeUndefined();
	});

	it.each(Object.values(TC.Method))(
		"METHOD %s RESOLVES CORRECTLY",
		(method) => {
			const path = `/${method.toLowerCase()}-method-test`;
			const route = new TC.Route({ method, path }, handler);

			expect(route.method).toBe(method);
			expect(route.id).toBe(`${method} ${path}`);
		},
	);

	it("USING EXTENDED ABSTRACT METHOD", async () => {
		const path = "/r-extended";

		class MyRoute extends TC.RouteAbstract {
			constructor() {
				super();
				this.register();
			}

			definition: TC.RouteDefinition<string> = path;
			callback: TC.RouteCallback = () => "extended";
			model?: TC.RouteModel<unknown, unknown, unknown, unknown> | undefined =
				undefined;
		}

		new MyRoute();
		const res = await s.handle(req(path));
		expect(res.status).toBe(200);
	});
});
