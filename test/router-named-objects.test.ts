import C from "../dist/index";
import { describe, expect, it } from "bun:test";
import { createTestServer } from "./utils/createTestServer";
import { createTestController } from "./utils/createTestController";
import { req } from "./utils/req";

const s = createTestServer();

const middlewareData = "Router";

const r1 = new C.Route("/r1", (c) => c.data);
const r2 = new C.Route("r2", (c) => c.data);
const c1 = createTestController("c1");
const m1 = new C.Middleware({
	useOn: [r1, c1.cr1],
	handler: (c) => {
		c.data = middlewareData;
	},
});

// s.register({
// 	routes: { r1, r2 },
// 	controllers: { c1 },
// 	middlewares: { m1 },
// });

describe("Router - Named Objects", () => {
	it("/r1 - SHOULD RETURN MIDDLEWARE DATA", async () => {
		const res = await s.handle(req("/r1"));
		const data = await C.Parser.getBody<string>(res);
		expect(data).toBe(middlewareData);
	});
	it("/r2 - SHOULD RETURN EMPTY OBJECT", async () => {
		const res = await s.handle(req("/r2"));
		const data = await C.Parser.getBody(res);
		expect(data).toBeEmptyObject();
	});
	it("/c1/cr1 - SHOULD RETURN MIDDLEWARE DATA", async () => {
		const res = await s.handle(req("/c1/cr1"));
		const data = await C.Parser.getBody<string>(res);
		expect(data).toBe(middlewareData);
	});
	it("/c1/cr2 - SHOULD RETURN EMPTY OBJECT", async () => {
		const res = await s.handle(req("/c1/cr2"));
		const data = await C.Parser.getBody(res);
		expect(data).toBeEmptyObject();
	});
});
