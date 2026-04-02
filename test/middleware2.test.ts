import { C, X } from "@/index";
import { describe, expect, it, spyOn, beforeEach } from "bun:test";
import { createTestServer } from "./utils/createTestServer";
import { createTestController } from "./utils/createTestController";
import { req } from "./utils/req";
import { log } from "@/utils/internalLogger";

describe("C.Middleware using extends", () => {
	const s = createTestServer();
	const middlewareData = "Hello";
	const overrideData = "world";
	const logSpy = spyOn(log, "log");
	beforeEach(() => logSpy.mockClear());

	const r1 = new C.Route("/r12", (c) => c.data);
	new C.Route("r22", (c) => c.data);
	const c1 = createTestController("c12");

	class M1 extends C.MiddlewareAbstract {
		constructor() {
			super();
			this.register();
		}
		useOn: C.MiddlewareUseOn = [r1, c1.cr1];
		handler: C.MiddlewareHandler = (c) => {
			c.data = middlewareData;
		};
	}

	new M1();

	const r3 = new C.Route("/r32", (c) => c.data);

	class M2 extends C.MiddlewareAbstract {
		constructor() {
			super();
			this.register();
		}
		override useOn: C.MiddlewareUseOn = [r3];
		override handler: C.MiddlewareHandler = (c) => {
			c.data = { user: "john", role: "admin", count: 1 };
		};
	}

	new M2();

	const r4 = new C.Route("/r42", (c) => c.data);

	class M3 extends C.MiddlewareAbstract {
		constructor() {
			super();
			this.register();
		}
		override useOn: C.MiddlewareUseOn = [r4];
		override handler: C.MiddlewareHandler = (c) => {
			c.data = { user: "john", role: "admin", count: 1 };
		};
	}
	class M4 extends C.MiddlewareAbstract {
		constructor() {
			super();
			this.register();
		}
		override useOn: C.MiddlewareUseOn = [r4];
		override handler: C.MiddlewareHandler = (c) => {
			(c.data as Record<string, unknown>).role = "superadmin";
			(c.data as Record<string, unknown>).count = 2;
		};
	}
	class M5 extends C.MiddlewareAbstract {
		constructor() {
			super();
			this.register();
		}
		override useOn: C.MiddlewareUseOn = "*";
		override handler: C.MiddlewareHandler = (c) => {
			log.log(c.url.pathname);
		};
	}

	new M3();
	new M4();
	new M5();

	it("ROUTE - APPLIES TO REGISTERED ROUTE", async () => {
		const res = await s.handle(req("/r12"));
		const data = await X.Parser.parseBody<string>(res);
		expect(data).toBe(middlewareData);
		expect(logSpy).toBeCalled();
	});

	it("ROUTE - DOES NOT APPLY TO UNREGISTERED ROUTE", async () => {
		const res = await s.handle(req("/r22"));
		const data = await X.Parser.parseBody(res);
		expect(data).toBeEmptyObject();
		expect(logSpy).toBeCalled();
	});

	it("CONTROLLER - APPLIES TO REGISTERED CONTROLLER ROUTE", async () => {
		const res = await s.handle(req("/c12/cr1"));
		const data = await X.Parser.parseBody<string>(res);
		expect(data).toBe(middlewareData);
		expect(logSpy).toBeCalled();
	});

	it("CONTROLLER - DOES NOT APPLY TO UNREGISTERED CONTROLLER ROUTE", async () => {
		const res = await s.handle(req("/c12/cr2"));
		const data = await X.Parser.parseBody(res);
		expect(data).toBeEmptyObject();
		expect(logSpy).toBeCalled();
	});

	it("ROUTE - OVERRIDES PREVIOUS MIDDLEWARE DATA", async () => {
		class M6 extends C.MiddlewareAbstract {
			constructor() {
				super();
				this.register();
			}
			override useOn: C.MiddlewareUseOn = [r1];
			override handler: C.MiddlewareHandler = (c) => {
				c.data = overrideData;
			};
		}
		new M6();

		const res = await s.handle(req("/r12"));
		const data = await X.Parser.parseBody<string>(res);
		expect(data).toBe(overrideData);
		expect(logSpy).toBeCalled();
	});

	it("ROUTE - SETS OBJECT DATA", async () => {
		const res = await s.handle(req("/r32"));
		const data = await X.Parser.parseBody<Record<string, unknown>>(res);
		expect(data).toEqual({ user: "john", role: "admin", count: 1 });
		expect(logSpy).toBeCalled();
	});

	it("ROUTE - MUTATES OBJECT DATA KEYS IN SUBSEQUENT MIDDLEWARE", async () => {
		const res = await s.handle(req("/r42"));
		const data = await X.Parser.parseBody<Record<string, unknown>>(res);
		expect(data.user).toBe("john");
		expect(data.role).toBe("superadmin");
		expect(data.count).toBe(2);
		expect(logSpy).toBeCalled();
	});
});
