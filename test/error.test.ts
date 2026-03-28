import { C, X } from "@/index";
import { describe, expect, it } from "bun:test";
import { createTestServer } from "./utils/createTestServer";
import { req } from "./utils/req";

const s = createTestServer();

describe("C.Error", () => {
	// ─── constructor ──────────────────────────────────────────────

	it("CONSTRUCTOR - SETS MESSAGE, STATUS AND DATA", () => {
		const err = new C.Error("something went wrong", 400, { field: "name" });
		expect(err.message).toBe("something went wrong");
		expect(err.status).toBe(400);
		expect(err.data).toEqual({ field: "name" });
	});

	it("CONSTRUCTOR - DATA IS OPTIONAL", () => {
		const err = new C.Error("oops", 500);
		expect(err.data).toBeUndefined();
	});

	it("CONSTRUCTOR - IS INSTANCE OF ERROR", () => {
		const err = new C.Error("oops", 500);
		expect(err).toBeInstanceOf(Error);
	});

	// ─── isStatusOf ───────────────────────────────────────────────

	it("IS STATUS OF - RETURNS TRUE WHEN STATUS MATCHES", () => {
		const err = new C.Error("not found", 404);
		expect(err.isStatusOf(404)).toBe(true);
	});

	it("IS STATUS OF - RETURNS FALSE WHEN STATUS DOES NOT MATCH", () => {
		const err = new C.Error("not found", 404);
		expect(err.isStatusOf(500)).toBe(false);
	});

	// ─── toResponse() ───────────────────────────────────────────────

	it("TO RESPONSE - RETURNS CORRECT STATUS", () => {
		const err = new C.Error("bad request", 400);
		const res = err.toResponse();
		expect(res.status).toBe(400);
	});

	it("TO RESPONSE - WITHOUT DATA USES ERROR TRUE", async () => {
		const err = new C.Error("bad request", 400);
		const res = err.toResponse();
		const data = await X.Parser.parseBody<{ error: boolean; message: string }>(
			res,
		);
		expect(data.error).toBe(true);
		expect(data.message).toBe("bad request");
	});

	it("TO RESPONSE - WITH DATA USES ERROR DATA", async () => {
		const err = new C.Error("invalid", 422, { field: "email" });
		const res = err.toResponse();
		const data = await X.Parser.parseBody<{ error: unknown; message: string }>(
			res,
		);
		expect(data.error).toEqual({ field: "email" });
		expect(data.message).toBe("invalid");
	});

	// ─── integration ──────────────────────────────────────────────

	it("INTEGRATION - THROWN IN ROUTE RETURNS CORRECT STATUS", async () => {
		new C.Route("/error-404", () => {
			throw new C.Error("not here", C.Status.NOT_FOUND);
		});

		const res = await s.handle(req("/error-404"));
		expect(res.status).toBe(404);
	});

	it("INTEGRATION - THROWN IN ROUTE RETURNS CORRECT BODY", async () => {
		new C.Route("/error-422", () => {
			throw new C.Error("invalid fields", C.Status.UNPROCESSABLE_ENTITY);
		});

		const res = await s.handle(req("/error-422"));
		const data = await X.Parser.parseBody<{ error: boolean; message: string }>(
			res,
		);
		expect(res.status).toBe(422);
		expect(data.message).toBe("invalid fields");
	});

	it("INTEGRATION - NOT FOUND ROUTE RETURNS 404", async () => {
		const res = await s.handle(req("/does-not-exist"));
		expect(res.status).toBe(404);
	});

	it("INTEGRATION - WRONG METHOD RETURNS 405 | 404", async () => {
		new C.Route("/error-method", () => "ok");

		const res = await s.handle(req("/error-method", { method: "POST" }));
		console.log(res.status);
		expect(res.status === 404 || res.status === 405).toBeTrue();
	});
});
