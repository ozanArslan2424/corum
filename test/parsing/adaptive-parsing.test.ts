import { ControllerAbstract } from "@/modules/Controller/ControllerAbstract";
import { HttpError } from "@/modules/HttpError/HttpError";
import { CommonHeaders } from "@/modules/HttpHeaders/enums/CommonHeaders";
import { Status } from "@/modules/HttpResponse/enums/Status";
import { Parser } from "@/modules/Parser/Parser";
import { Route } from "@/modules/Route/Route";
import { type } from "arktype";
import { describe, expect, it } from "bun:test";
import z from "zod";
import { testServer } from "../utils/testServer";
import { joinPathSegments } from "@/utils/joinPathSegments";
import { getRouterInstance } from "@/modules/Router/RouterInstance";
import { TEST_URL } from "../utils/TEST_URL";
import type { InferModel } from "@/modules/Parser/types/InferModel";

const successData = { hello: 1 };
const failData = { unknown: "object" };
const successRouteData = {
	params: successData,
	search: successData,
	body: successData,
};
const failRouteData = {
	params: failData,
	search: failData,
	body: failData,
};

type ST = typeof successRouteData;

const arkBasic = type({ hello: "number" });

const zodBasic = z.object({ hello: z.number() });

class Model {
	static arkModelBasic = type({ hello: "number" });

	static zodModelBasic = z.object({ hello: z.number() });

	static arkReferenced = arkBasic;

	static zodReferenced = zodBasic;

	static arkRoute = {
		params: type({ hello: "number" }),
		search: type({ hello: "number" }),
		body: type({ hello: "number" }),
	};

	static zodRoute = {
		params: z.object({ hello: z.number() }),
		search: z.object({ hello: z.number() }),
		body: z.object({ hello: z.number() }),
	};

	static arkRouteReferenced = {
		params: this.arkModelBasic,
		search: this.arkRoute.search,
		body: arkBasic,
	};

	static zodRouteReferenced = {
		params: this.zodModelBasic,
		search: this.zodRoute.search,
		body: zodBasic,
	};

	static combined = {
		params: type({ hello: "number" }),
		search: z.object({ hello: z.number() }),
		body: this.arkRoute.body,
	};
}

type ModelType = InferModel<typeof Model>;

class Controller extends ControllerAbstract {
	constructor() {
		super({ prefix: "/controller" });
	}

	arkRoute = this.route(
		{ method: "POST", path: "/arkRoute/:hello" },
		(c) => ({ body: c.body, params: c.params, search: c.search }),
		Model.arkRoute,
	);
	arkRouteReferenced = this.route(
		{ method: "POST", path: "/arkRouteReferenced/:hello" },
		(c) => ({ body: c.body, params: c.params, search: c.search }),
		Model.arkRouteReferenced,
	);
	zodRoute = this.route(
		{ method: "POST", path: "/zodRoute/:hello" },
		(c) => ({ body: c.body, params: c.params, search: c.search }),
		Model.zodRoute,
	);
	zodRouteReferenced = this.route(
		{ method: "POST", path: "/zodRouteReferenced/:hello" },
		(c) => ({ body: c.body, params: c.params, search: c.search }),
		Model.zodRouteReferenced,
	);
	combined = this.route(
		{ method: "POST", path: "/combined/:hello" },
		(c) => ({ body: c.body, params: c.params, search: c.search }),
		Model.combined,
	);

	optional = this.route("/optional", (c) => c.search, {
		search: type({ "groupId?": "number | undefined" }),
	});

	missing = this.route("/missing/:param", (c) => c.params.param, {
		params: type({ param: "string" }),
	});
}

new Controller();

const path = (...segments: (string | number)[]) =>
	`${TEST_URL}${joinPathSegments(
		getRouterInstance().globalPrefix,
		...segments,
	)}`;

// prettier-ignore
describe("adaptive parsing based on library and schema definition", () => {
	it("arkBasic - variant", () => { expect(Parser.getParserVendor(arkBasic["~standard"])).toBe("arktype"); });
	it("zodBasic - variant", () => { expect(Parser.getParserVendor(zodBasic["~standard"])).toBe("zod"); });
	it("arkModelBasic - variant", () => { expect(Parser.getParserVendor(Model.arkModelBasic["~standard"])).toBe("arktype"); });
	it("zodModelBasic - variant", () => { expect(Parser.getParserVendor(Model.zodModelBasic["~standard"])).toBe("zod"); });
	it("arkReferenced - variant", () => { expect(Parser.getParserVendor(Model.arkReferenced["~standard"])).toBe("arktype"); });
	it("zodReferenced - variant", () => { expect(Parser.getParserVendor(Model.zodReferenced["~standard"])).toBe("zod"); });
	it("arkRoute - variant", () => {
		expect(Parser.getParserVendor(Model.arkRoute.params["~standard"])).toBe("arktype");
		expect(Parser.getParserVendor(Model.arkRoute.search["~standard"])).toBe("arktype");
		expect(Parser.getParserVendor(Model.arkRoute.body["~standard"])).toBe("arktype");
	});
	it("zodRoute - variant", () => {
		expect(Parser.getParserVendor(Model.zodRoute.params["~standard"])).toBe("zod");
		expect(Parser.getParserVendor(Model.zodRoute.search["~standard"])).toBe("zod");
		expect(Parser.getParserVendor(Model.zodRoute.body["~standard"])).toBe("zod");
	});
	it("arkRouteReferenced - variant", () => {
		expect(Parser.getParserVendor(Model.arkRouteReferenced.params["~standard"])).toBe("arktype");
		expect(Parser.getParserVendor(Model.arkRouteReferenced.search["~standard"])).toBe("arktype");
		expect(Parser.getParserVendor(Model.arkRouteReferenced.body["~standard"])).toBe("arktype");
	});
	it("zodRouteReferenced - variant", () => {
		expect(Parser.getParserVendor(Model.zodRouteReferenced.params["~standard"])).toBe("zod");
		expect(Parser.getParserVendor(Model.zodRouteReferenced.search["~standard"])).toBe("zod");
		expect(Parser.getParserVendor(Model.zodRouteReferenced.body["~standard"])).toBe("zod");
	});

	it("arkBasic - success", async () => { expect(await Parser.parse(successData, arkBasic["~standard"])).toEqual(successData); });
	it("zodBasic - success", async () => { expect(await Parser.parse(successData, zodBasic["~standard"])).toEqual(successData); });
	it("arkModelBasic - success", async () => { expect(await Parser.parse(successData, Model.arkModelBasic["~standard"])).toEqual(successData); });
	it("zodModelBasic - success", async () => { expect(await Parser.parse(successData, Model.zodModelBasic["~standard"])).toEqual(successData); });
	it("arkReferenced - success", async () => { expect(await Parser.parse(successData, Model.arkReferenced["~standard"])).toEqual(successData); });
	it("zodReferenced - success", async () => { expect(await Parser.parse(successData, Model.zodReferenced["~standard"])).toEqual(successData); });
	it("arkRoute - success", async () => {
		expect(await Parser.parse(successRouteData.params, Model.arkRoute.params["~standard"])).toEqual(successRouteData.params);
		expect(await Parser.parse(successRouteData.search, Model.arkRoute.search["~standard"])).toEqual(successRouteData.search);
		expect(await Parser.parse(successRouteData.body, Model.arkRoute.body["~standard"])).toEqual(successRouteData.body);
	});
	it("zodRoute - success", async () => {
		expect(await Parser.parse(successRouteData.params, Model.zodRoute.params["~standard"])).toEqual(successRouteData.params);
		expect(await Parser.parse(successRouteData.search, Model.zodRoute.search["~standard"])).toEqual(successRouteData.search);
		expect(await Parser.parse(successRouteData.body, Model.zodRoute.body["~standard"])).toEqual(successRouteData.body);
	});
	it("arkRouteReferenced - success", async () => {
		expect(await Parser.parse(successRouteData.params, Model.arkRouteReferenced.params["~standard"])).toEqual(successRouteData.params);
		expect(await Parser.parse(successRouteData.search, Model.arkRouteReferenced.search["~standard"])).toEqual(successRouteData.search);
		expect(await Parser.parse(successRouteData.body, Model.arkRouteReferenced.body["~standard"])).toEqual(successRouteData.body);
	});
	it("zodRouteReferenced - success", async () => {
		expect(await Parser.parse(successRouteData.params, Model.zodRouteReferenced.params["~standard"])).toEqual(successRouteData.params);
		expect(await Parser.parse(successRouteData.search, Model.zodRouteReferenced.search["~standard"])).toEqual(successRouteData.search);
		expect(await Parser.parse(successRouteData.body, Model.zodRouteReferenced.body["~standard"])).toEqual(successRouteData.body);
	});
	it("arkRoute - Real Request - success", async () => {
		new Route({ method: "POST", path: "/success/arkRoute/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.arkRoute)
		const url = new URL(path("success", "arkRoute", "hello", successRouteData.params.hello))
		url.searchParams.set("hello", successRouteData.search.hello.toString())
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(successRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(await Parser.getBody<ST>(res)).toEqual(successRouteData)
	})
	it("zodRoute - Real Request - success", async () => {
		new Route({ method: "POST", path: "/success/zodRoute/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.zodRoute)
		const url = new URL(path("success", "zodRoute", "hello", successRouteData.params.hello))
		url.searchParams.set("hello", successRouteData.search.hello.toString())
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(successRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(await Parser.getBody<ST>(res)).toEqual(successRouteData)
	})
	it("arkRouteReferenced - Real Request - success", async () => {
		new Route({ method: "POST", path: "/success/arkRouteReferenced/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.arkRouteReferenced)
		const url = new URL(path("success", "arkRouteReferenced", "hello", successRouteData.params.hello))
		url.searchParams.set("hello", successRouteData.search.hello.toString())
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(successRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(await Parser.getBody<ST>(res)).toEqual(successRouteData)
	})
	it("zodRouteReferenced - Real Request - success", async () => {
		new Route({ method: "POST", path: "/success/zodRouteReferenced/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.zodRouteReferenced)
		const url = new URL(path("success", "zodRouteReferenced", "hello", successRouteData.params.hello))
		url.searchParams.set("hello", successRouteData.search.hello.toString())
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(successRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(await Parser.getBody<ST>(res)).toEqual(successRouteData)
	})
	it("combined - Real Request - success", async () => {
		new Route({ method: "POST", path: "/success/combined/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.combined)
		const url = new URL(path("success", "combined", "hello", successRouteData.params.hello))
		url.searchParams.set("hello", successRouteData.search.hello.toString())
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(successRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(await Parser.getBody<ST>(res)).toEqual(successRouteData)
	})
	it("Controller - Real Request - success", async () => {
		const url = new URL(path("controller", "combined", successRouteData.params.hello))
		url.searchParams.set("hello", successRouteData.search.hello.toString())
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(successRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(await Parser.getBody<ST>(res)).toEqual(successRouteData)
	})


	it("arkBasic - fail", () => { expect(async () => await Parser.parse(failData, arkBasic["~standard"])).toThrow(HttpError); });
	it("zodBasic - fail", () => { expect(async () => await Parser.parse(failData, zodBasic["~standard"])).toThrow(HttpError); });
	it("arkModelBasic - fail", () => { expect(async () => await Parser.parse(failData, Model.arkModelBasic["~standard"])).toThrow(HttpError); });
	it("zodModelBasic - fail", () => { expect(async () => await Parser.parse(failData, Model.zodModelBasic["~standard"])).toThrow(HttpError); });
	it("arkReferenced - fail", () => { expect(async () => await Parser.parse(failData, Model.arkReferenced["~standard"])).toThrow(HttpError); });
	it("zodReferenced - fail", () => { expect(async () => await Parser.parse(failData, Model.zodReferenced["~standard"])).toThrow(HttpError); });
	it("arkRoute - fail", () => {
		expect(async () => await Parser.parse(failRouteData.params, Model.arkRoute.params["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.search, Model.arkRoute.search["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.body, Model.arkRoute.body["~standard"])).toThrow(HttpError);
	});
	it("zodRoute - fail", () => {
		expect(async () => await Parser.parse(failRouteData.params, Model.zodRoute.params["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.search, Model.zodRoute.search["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.body, Model.zodRoute.body["~standard"])).toThrow(HttpError);
	});
	it("arkRouteReferenced - fail", () => {
		expect(async () => await Parser.parse(failRouteData.params, Model.arkRouteReferenced.params["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.search, Model.arkRouteReferenced.search["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.body, Model.arkRouteReferenced.body["~standard"])).toThrow(HttpError);
	});
	it("zodRouteReferenced - fail", () => {
		expect(async () => await Parser.parse(failRouteData.params, Model.zodRouteReferenced.params["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.search, Model.zodRouteReferenced.search["~standard"])).toThrow(HttpError);
		expect(async () => await Parser.parse(failRouteData.body, Model.zodRouteReferenced.body["~standard"])).toThrow(HttpError);
	});
	it("arkRoute - Real Request - fail", async () => {
		new Route({ method: "POST", path: "/fail/arkRoute/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.arkRoute)
		const url = new URL(path("fail", "arkRoute", "hello", failRouteData.params.unknown))
		url.searchParams.set("unknown", failRouteData.search.unknown)
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(failRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(res.ok).toBe(false)
		expect(res.status).toBe(Status.UNPROCESSABLE_ENTITY)
	})
	it("zodRoute - Real Request - fail", async () => {
		new Route({ method: "POST", path: "/fail/zodRoute/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.zodRoute)
		const url = new URL(path("fail", "zodRoute", "hello", failRouteData.params.unknown))
		url.searchParams.set("unknown", failRouteData.search.unknown)
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(failRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(res.ok).toBe(false)
		expect(res.status).toBe(Status.UNPROCESSABLE_ENTITY)
	})
	it("arkRouteReferenced - Real Request - fail", async () => {
		new Route({ method: "POST", path: "/fail/arkRouteReferenced/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.arkRouteReferenced)
		const url = new URL(path("fail", "arkRouteReferenced", "hello", failRouteData.params.unknown))
		url.searchParams.set("unknown", failRouteData.search.unknown)
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(failRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(res.ok).toBe(false)
		expect(res.status).toBe(Status.UNPROCESSABLE_ENTITY)
	})
	it("zodRouteReferenced - Real Request - fail", async () => {
		new Route({ method: "POST", path: "/fail/zodRouteReferenced/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.zodRouteReferenced)
		const url = new URL(path("fail", "zodRouteReferenced", "hello", failRouteData.params.unknown))
		url.searchParams.set("unknown", failRouteData.search.unknown)
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(failRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(res.ok).toBe(false)
		expect(res.status).toBe(Status.UNPROCESSABLE_ENTITY)
	})
	it("combined - Real Request - fail", async () => {
		new Route({ method: "POST", path: "/fail/combined/hello/:hello" }, (c) => ({ body: c.body, params: c.params, search: c.search }), Model.combined)
		const url = new URL(path("fail", "combined", "hello", failRouteData.params.unknown))
		url.searchParams.set("unknown", failRouteData.search.unknown)
		const res = await testServer.handle(new Request(url, { body: JSON.stringify(failRouteData.body), method: "POST", headers: { [CommonHeaders.ContentType]: "application/json" } }))
		expect(res.ok).toBe(false)
		expect(res.status).toBe(Status.UNPROCESSABLE_ENTITY)
	})

	it("optional - provided", async () => {
		const url = new URL(path("controller", "optional"))
		url.searchParams.set("groupId", "8")
		const res = await testServer.handle(new Request(url))
		expect(await Parser.getBody<{ groupId: number }>(res)).toEqual({ groupId: 8 })
	})

	it("optional - missing", async () => {
		const url = new URL(path("controller", "optional"))
		const res = await testServer.handle(new Request(url))
		const body = await Parser.getBody<{}>(res)
		expect(body).toBeEmptyObject()
	})

	it("missing required param", async () => {
		const url = new URL(path("controller", "missing"))
		const res = await testServer.handle(new Request(url))
		expect(res.ok).toBe(false)
	})
});
