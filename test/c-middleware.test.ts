import { $registryTesting, TC, testLog } from "./_modules";
import { describe, expect, it, spyOn, beforeEach } from "bun:test";
import { createTestServer } from "./utils/createTestServer";
import { createTestController } from "./utils/createTestController";
import { req } from "./utils/req";

const s = createTestServer();
const middlewareData = "Hello";
const overrideData = "world";
const testLogSpy = spyOn(testLog, "log");

describe("C.Middleware using constructor", () => {
	it("ROUTE - APPLIES TO REGISTERED ROUTE - using constructor", async () => {
		const res = await s.handle(req("/r1"));
		const data = await TC.Parser.parseBody<string>(res);
		expect(data).toBe(middlewareData);
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - DOES NOT APPLY TO UNREGISTERED ROUTE - using constructor", async () => {
		const res = await s.handle(req("/r2"));
		const data = await TC.Parser.parseBody(res);
		expect(data).toBeEmptyObject();
		expect(testLogSpy).toBeCalled();
	});

	it("CONTROLLER - APPLIES TO REGISTERED CONTROLLER ROUTE - using constructor", async () => {
		const res = await s.handle(req("/c1/cr1"));
		const data = await TC.Parser.parseBody<string>(res);
		expect(data).toBe(middlewareData);
		expect(testLogSpy).toBeCalled();
	});

	it("CONTROLLER - DOES NOT APPLY TO UNREGISTERED CONTROLLER ROUTE - using constructor", async () => {
		const res = await s.handle(req("/c1/cr2"));
		const data = await TC.Parser.parseBody(res);
		expect(data).toBeEmptyObject();
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - OVERRIDES PREVIOUS MIDDLEWARE DATA - using constructor", async () => {
		const res = await s.handle(req("/r5"));
		const data = await TC.Parser.parseBody<string>(res);
		expect(data).toBe(overrideData);
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - SETS OBJECT DATA - using constructor", async () => {
		const res = await s.handle(req("/r3"));
		const data = await TC.Parser.parseBody<Record<string, unknown>>(res);
		expect(data).toEqual({ user: "john", role: "admin", count: 1 });
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - MUTATES OBJECT DATA KEYS IN SUBSEQUENT MIDDLEWARE - using constructor", async () => {
		const res = await s.handle(req("/r4"));
		const data = await TC.Parser.parseBody<Record<string, unknown>>(res);
		expect(data.user).toBe("john");
		expect(data.role).toBe("superadmin");
		expect(data.count).toBe(2);
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - APPLIES TO REGISTERED ROUTE - using extends", async () => {
		const res = await s.handle(req("/c-r1"));
		const data = await TC.Parser.parseBody<string>(res);
		expect(data).toBe(middlewareData);
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - DOES NOT APPLY TO UNREGISTERED ROUTE - using extends", async () => {
		const res = await s.handle(req("/c-r2"));
		const data = await TC.Parser.parseBody(res);
		expect(data).toBeEmptyObject();
		expect(testLogSpy).toBeCalled();
	});

	it("CONTROLLER - APPLIES TO REGISTERED CONTROLLER ROUTE - using extends", async () => {
		const res = await s.handle(req("/c-c1/cr1"));
		const data = await TC.Parser.parseBody<string>(res);
		expect(data).toBe(middlewareData);
		expect(testLogSpy).toBeCalled();
	});

	it("CONTROLLER - DOES NOT APPLY TO UNREGISTERED CONTROLLER ROUTE - using extends", async () => {
		const res = await s.handle(req("/c-c1/cr2"));
		const data = await TC.Parser.parseBody(res);
		expect(data).toBeEmptyObject();
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - OVERRIDES PREVIOUS MIDDLEWARE DATA - using extends", async () => {
		const res = await s.handle(req("/c-r5"));
		const data = await TC.Parser.parseBody<string>(res);
		expect(data).toBe(overrideData);
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - SETS OBJECT DATA - using extends", async () => {
		const res = await s.handle(req("/c-r3"));
		const data = await TC.Parser.parseBody<Record<string, unknown>>(res);
		expect(data).toEqual({ user: "john", role: "admin", count: 1 });
		expect(testLogSpy).toBeCalled();
	});

	it("ROUTE - MUTATES OBJECT DATA KEYS IN SUBSEQUENT MIDDLEWARE - using extends", async () => {
		const res = await s.handle(req("/c-r4"));
		const data = await TC.Parser.parseBody<Record<string, unknown>>(res);
		expect(data.user).toBe("john");
		expect(data.role).toBe("superadmin");
		expect(data.count).toBe(2);
		expect(testLogSpy).toBeCalled();
	});
});

class M1 extends TC.MiddlewareAbstract {
	constructor(readonly useOn: TC.MiddlewareUseOn) {
		super();
		this.register();
	}
	handler: TC.MiddlewareHandler = (c) => {
		c.data = middlewareData;
	};
}
class M2 extends TC.MiddlewareAbstract {
	constructor(readonly useOn: TC.MiddlewareUseOn) {
		super();
		this.register();
	}
	override handler: TC.MiddlewareHandler = (c) => {
		c.data = { user: "john", role: "admin", count: 1 };
	};
}
class M3 extends TC.MiddlewareAbstract {
	constructor(readonly useOn: TC.MiddlewareUseOn) {
		super();
		this.register();
	}
	override handler: TC.MiddlewareHandler = (c) => {
		c.data = { user: "john", role: "admin", count: 1 };
	};
}
class M4 extends TC.MiddlewareAbstract {
	constructor(readonly useOn: TC.MiddlewareUseOn) {
		super();
		this.register();
	}

	override handler: TC.MiddlewareHandler = (c) => {
		(c.data as Record<string, unknown>).role = "superadmin";
		(c.data as Record<string, unknown>).count = 2;
	};
}
class M5 extends TC.MiddlewareAbstract {
	constructor(readonly useOn: TC.MiddlewareUseOn) {
		super();
		this.register();
	}

	override handler: TC.MiddlewareHandler = (c) => {
		testLog.log(c.url.pathname);
	};
}
class M6 extends TC.MiddlewareAbstract {
	constructor(readonly useOn: TC.MiddlewareUseOn) {
		super();
		this.register();
	}

	override handler: TC.MiddlewareHandler = (c) => {
		c.data = overrideData;
	};
}

beforeEach(() => {
	$registryTesting.reset();
	testLogSpy.mockClear();

	const r1 = new TC.Route("/r1", (c) => c.data);
	new TC.Route("r2", (c) => c.data);
	const r3 = new TC.Route("/r3", (c) => c.data);
	const r4 = new TC.Route("/r4", (c) => c.data);
	const r5 = new TC.Route("/r5", (c) => c.data);
	const c1 = createTestController("c1");

	new TC.Middleware({
		useOn: [r1, c1.cr1],
		handler: (c) => {
			c.data = middlewareData;
		},
	});

	new TC.Middleware({
		useOn: [r3],
		handler: (c) => {
			c.data = { user: "john", role: "admin", count: 1 };
		},
	});

	new TC.Middleware({
		useOn: [r4],
		handler: (c) => {
			c.data = { user: "john", role: "admin", count: 1 };
		},
	});

	new TC.Middleware({
		useOn: [r4],
		handler: (c) => {
			(c.data as Record<string, unknown>).role = "superadmin";
			(c.data as Record<string, unknown>).count = 2;
		},
	});

	new TC.Middleware({
		useOn: "*",
		handler: (c) => {
			testLog.log(c.url.pathname);
		},
	});

	new TC.Middleware({
		useOn: [r5],
		handler: (c) => {
			c.data = overrideData;
		},
	});

	const c_r1 = new TC.Route("/c-r1", (c) => c.data);
	new TC.Route("c-r2", (c) => c.data);
	const c_r3 = new TC.Route("/c-r3", (c) => c.data);
	const c_r4 = new TC.Route("/c-r4", (c) => c.data);
	const c_r5 = new TC.Route("/c-r5", (c) => c.data);
	const c_c1 = createTestController("c-c1");

	new M1([c_r1, c_c1.cr1]);
	new M2([c_r3]);
	new M3([c_r4]);
	new M4([c_r4]);
	new M5("*");
	new M6([c_r5]);
});
