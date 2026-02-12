import { Middleware } from "@/internal/modules/Middleware/Middleware";
import { describe, it, expect } from "bun:test";
import { Controller } from "@/index";
import { reqMaker } from "test/utils/reqMaker";
import { pathMaker } from "test/utils/pathMaker";
import { testServer } from "test/utils/testServer";

const globalPrefix = "/middleware/use-on-controller";
const path = pathMaker(globalPrefix);
const req = reqMaker(globalPrefix);

class TestController extends Controller {
	constructor(prefix: string) {
		super({ prefix: path(prefix) });
	}

	one = this.route("/one", (c) => c.data);

	two = this.route("/two", (c) => c.data);

	twoOverride = this.route("/two/override", (c) => c.data);
}

describe("Middleware Data", () => {
	it("use (Controller) - One Middleware", async () => {
		const mw1 = new Middleware((c) => {
			c.data = {
				hello: "world",
			};
		});
		mw1.use(new TestController("/use"));
		const res = await testServer.handle(req("/use/one", { method: "GET" }));
		expect(await res.json()).toEqual({ hello: "world" });
	});

	it("useOnController - One Middleware", async () => {
		const mw1 = new Middleware((c) => {
			c.data = {
				hello: "world",
			};
		});
		mw1.useOnController(new TestController("/one"));
		const res = await testServer.handle(req("/one/one", { method: "GET" }));
		expect(await res.json()).toEqual({ hello: "world" });
	});

	it("useOnController - Two Middlewares No Override", async () => {
		const mw1 = new Middleware((c) => {
			c.data = {
				hello: "world",
			};
		});
		const mw2 = new Middleware((c) => {
			c.data.ozan = "arslan";
		});
		mw1.useOnController(mw2.useOnController(new TestController("/two")));
		const res = await testServer.handle(req("/two/two", { method: "GET" }));
		expect(await res.json()).toEqual({
			hello: "world",
			ozan: "arslan",
		});
	});

	it("useOnController - Two Middlewares WITH Override", async () => {
		const mw1 = new Middleware((c) => {
			c.data.ozan = "arslan";
		});
		const mw2 = new Middleware((c) => {
			c.data = {
				hello: "world",
			};
		});
		mw1.useOnController(mw2.useOnController(new TestController("/three")));
		const res = await testServer.handle(
			req("/three/two/override", { method: "GET" }),
		);
		expect(await res.json()).toEqual({ hello: "world" });
	});
});
