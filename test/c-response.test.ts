import { $registryTesting, TC } from "./_modules";
import { afterEach, describe, expect, it } from "bun:test";

afterEach(() => $registryTesting.reset());

describe("C.Response", () => {
	const ctHeader = TC.CommonHeaders.ContentType;
	const otherHeader = "other-header";
	const otherHeaderValue = "other-header-value";
	const locHeader = TC.CommonHeaders.Location;
	const locUrl = "/hello";

	async function expectData({
		res,
		response,
		data,
		expectedBody = "",
		expectedCtHeader = "text/plain",
		expectedStatus = TC.Status.OK,
		expectedOK = true,
	}: {
		res: TC.Response;
		response: Response;
		data: any;
		expectedBody?: any;
		expectedCtHeader?: string;
		expectedStatus?: number;
		expectedOK?: boolean;
	}) {
		// types and instances
		expect(res.headers).toBeInstanceOf(TC.Headers);
		expect(res.cookies).toBeInstanceOf(TC.Cookies);
		expect(res.status).toBeTypeOf("number");
		expect(res.statusText).toBeTypeOf("string");

		// input data transformed
		expect(res.body).toBe(expectedBody);
		expect(res.headers.get(ctHeader)).toBe(expectedCtHeader);
		expect(res.status).toBe(expectedStatus);

		// web data
		expect(data).toBe(expectedBody);
		expect(response.headers.get(ctHeader)).toBe(expectedCtHeader);
		expect(response.status).toBe(expectedStatus);
		expect(response.ok).toBe(expectedOK);
		return;
	}

	it("EMPTY BODY", async () => {
		const res = new TC.Response();
		const response = res.response;
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
		});
	});

	it("NULL BODY", async () => {
		const res = new TC.Response(null);
		const response = res.response;
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
		});
	});

	it("UNDEFINED BODY", async () => {
		const res = new TC.Response(undefined);
		const response = res.response;
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
		});
	});

	it("REDIRECT BY INIT HEADERS", async () => {
		const res = new TC.Response(undefined, { headers: [[locHeader, locUrl]] });
		expect(res.headers.get(locHeader)).toBe(locUrl);
		const response = res.response;
		expect(response.headers.get(locHeader)).toBe(locUrl);
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
			expectedOK: false,
			expectedStatus: TC.Status.FOUND,
		});
	});

	it("REDIRECT BY STATIC METHOD - REDIRECT", async () => {
		const res = TC.Response.redirect(locUrl);
		expect(res.headers.get(locHeader)).toBe(locUrl);
		const response = res.response;
		expect(response.headers.get(locHeader)).toBe(locUrl);
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
			expectedOK: false,
			expectedStatus: TC.Status.FOUND,
		});
	});

	it("REDIRECT BY STATIC METHOD - REDIRECT - WITH EXTRA HEADERS", async () => {
		const res = TC.Response.redirect(locUrl, {
			headers: [[otherHeader, otherHeaderValue]],
		});
		expect(res.headers.get(locHeader)).toBe(locUrl);
		expect(res.headers.get(otherHeader)).toBe(otherHeaderValue);
		const response = res.response;
		expect(response.headers.get(locHeader)).toBe(locUrl);
		expect(response.headers.get(otherHeader)).toBe(otherHeaderValue);
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
			expectedOK: false,
			expectedStatus: TC.Status.FOUND,
		});
	});

	it("REDIRECT BY STATIC METHOD - PERMANENT REDIRECT", async () => {
		const res = TC.Response.permanentRedirect(locUrl);
		expect(res.headers.get(locHeader)).toBe(locUrl);
		const response = res.response;
		expect(response.headers.get(locHeader)).toBe(locUrl);
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
			expectedOK: false,
			expectedStatus: TC.Status.MOVED_PERMANENTLY,
		});
	});

	it("REDIRECT BY STATIC METHOD - TEMPORARY REDIRECT", async () => {
		const res = TC.Response.temporaryRedirect(locUrl);
		expect(res.headers.get(locHeader)).toBe(locUrl);
		const response = res.response;
		expect(response.headers.get(locHeader)).toBe(locUrl);
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
			expectedOK: false,
			expectedStatus: TC.Status.TEMPORARY_REDIRECT,
		});
	});

	it("REDIRECT BY STATIC METHOD - SEE OTHER", async () => {
		const res = TC.Response.seeOther(locUrl);
		expect(res.headers.get(locHeader)).toBe(locUrl);
		const response = res.response;
		expect(response.headers.get(locHeader)).toBe(locUrl);
		const data = await response.text();
		await expectData({
			res,
			response,
			data,
			expectedOK: false,
			expectedStatus: TC.Status.SEE_OTHER,
		});
	});

	it("SSE - RETURNS STREAM WITH CORRECT HEADERS", async () => {
		const res = TC.Response.sse((send) => {
			send({ event: "ping", data: { time: 1 } });
		});
		const response = res.response;

		expect(res.status).toBe(TC.Status.OK);
		expect(res.body).toBeInstanceOf(ReadableStream);
		expect(res.headers.get(TC.CommonHeaders.ContentType)).toBe(
			"text/event-stream",
		);
		expect(res.headers.get(TC.CommonHeaders.CacheControl)).toBe("no-cache");
		expect(res.headers.get(TC.CommonHeaders.Connection)).toBe("keep-alive");
		expect(response.headers.get(TC.CommonHeaders.ContentType)).toBe(
			"text/event-stream",
		);
	});

	it("SSE - STREAM EMITS CORRECT CHUNKS", async () => {
		const res = TC.Response.sse((send) => {
			send({ event: "ping", data: { time: 1 } });
			send({ id: "2", event: "pong", data: { time: 2 } });
		});

		const text = await res.response.text();
		expect(text).toContain("event: ping\n");
		expect(text).toContain('data: {"time":1}\n\n');
		expect(text).toContain("id: 2\n");
		expect(text).toContain("event: pong\n");
		expect(text).toContain('data: {"time":2}\n\n');
	});

	it("SSE - RETRY FIELD IS INCLUDED WHEN SET", async () => {
		const res = TC.Response.sse(
			(send) => {
				send({ data: "ok" });
			},
			undefined,
			3000,
		);

		const text = await res.response.text();
		expect(text).toContain("retry: 3000\n");
	});

	it("SSE - CLEANUP IS CALLED ON CANCEL", async () => {
		let cleaned = false;
		const res = TC.Response.sse(() => {
			return () => {
				cleaned = true;
			};
		});

		const reader = res.response.body!.getReader();
		await reader.cancel();
		expect(cleaned).toBe(true);
	});

	it("ARRAYBUFFER BODY", async () => {
		const buffer = new TextEncoder().encode("hello").buffer;
		const res = new TC.Response(buffer);
		const response = res.response;

		expect(res.body).toBeInstanceOf(ArrayBuffer);
		expect(res.headers.get(ctHeader)).toBe("application/octet-stream");
		expect(res.status).toBe(TC.Status.OK);
		const text = await response.text();
		expect(text).toBe("hello");
	});

	it("BLOB BODY", async () => {
		const blob = new Blob(["hello"], { type: "text/html" });
		const res = new TC.Response(blob);
		const response = res.response;

		expect(res.body).toBeInstanceOf(Blob);
		expect(res.status).toBe(TC.Status.OK);
		const text = await response.text();
		expect(text).toBe("hello");
		expect(response.headers.get(ctHeader)).toContain("text/html");
	});

	it("FORMDATA BODY", async () => {
		const form = new FormData();
		form.append("name", "corpus");
		const res = new TC.Response(form);
		const response = res.response;

		expect(res.body).toBeInstanceOf(FormData);
		expect(res.status).toBe(TC.Status.OK);
		const text = await response.text();
		expect(text).toContain("corpus");
		expect(response.headers.get(ctHeader)).toContain("multipart/form-data");
	});

	it("URLSEARCHPARAMS BODY", async () => {
		const params = new URLSearchParams({ name: "corpus" });
		const res = new TC.Response(params);
		const response = res.response;

		expect(res.body).toBeInstanceOf(URLSearchParams);
		expect(res.status).toBe(TC.Status.OK);
		const text = await response.text();
		expect(text).toBe("name=corpus");
		expect(response.headers.get(ctHeader)).toContain(
			"application/x-www-form-urlencoded",
		);
	});

	it("NDJSON - RETURNS STREAM WITH CORRECT HEADERS", async () => {
		const res = TC.Response.ndjson((send) => {
			send({ id: 1 });
		});
		const response = res.response;

		expect(res.status).toBe(TC.Status.OK);
		expect(res.body).toBeInstanceOf(ReadableStream);
		expect(res.headers.get(ctHeader)).toBe("application/x-ndjson");
		expect(response.headers.get(ctHeader)).toBe("application/x-ndjson");
	});

	it("NDJSON - STREAM EMITS CORRECT CHUNKS", async () => {
		const res = TC.Response.ndjson((send) => {
			send({ id: 1, name: "alice" });
			send({ id: 2, name: "bob" });
		});

		const text = await res.response.text();
		const lines = text.trim().split("\n");
		expect(lines).toHaveLength(2);
		expect(lines[0]).toBeDefined();
		expect(lines[1]).toBeDefined();

		expect(JSON.parse(lines[0]!)).toEqual({ id: 1, name: "alice" });
		expect(JSON.parse(lines[1]!)).toEqual({ id: 2, name: "bob" });
	});

	it("NDJSON - CLEANUP IS CALLED ON CANCEL", async () => {
		let cleaned = false;
		const res = TC.Response.ndjson(() => {
			return () => {
				cleaned = true;
			};
		});

		const reader = res.response.body!.getReader();
		await reader.cancel();
		expect(cleaned).toBe(true);
	});

	// ─── streamFile ───────────────────────────────────────────────────────────────

	it("STREAM FILE - RETURNS STREAM WITH CORRECT HEADERS FOR TXT", async () => {
		const res = await TC.Response.streamFile("test/fixtures/sample.txt");

		expect(res.status).toBe(TC.Status.OK);
		expect(res.body).toBeInstanceOf(ReadableStream);
		expect(res.headers.get(ctHeader)).toBe("text/plain");
		expect(res.headers.get(TC.CommonHeaders.ContentDisposition)).toBe(
			'attachment; filename="sample.txt"',
		);
	});

	it("STREAM FILE - INFERS CORRECT MIME TYPE", async () => {
		const cases: [string, string][] = [
			["test/fixtures/sample.html", "text/html"],
			["test/fixtures/sample.css", "text/css"],
			["test/fixtures/sample.js", "application/javascript"],
			["test/fixtures/sample.json", "application/json"],
			["test/fixtures/sample.xyz", "application/octet-stream"],
		];

		for (const [path, expectedMime] of cases) {
			const res = await TC.Response.streamFile(path);
			expect(res.headers.get(ctHeader)).toBe(expectedMime);
		}
	});

	it("STREAM FILE - INLINE DISPOSITION", async () => {
		const res = await TC.Response.streamFile(
			"test/fixtures/sample.txt",
			"inline",
		);
		expect(res.headers.get(TC.CommonHeaders.ContentDisposition)).toBe(
			'inline; filename="sample.txt"',
		);
	});

	it("STREAM FILE - THROWS NOT FOUND FOR MISSING FILE", async () => {
		expect(
			TC.Response.streamFile("test/fixtures/does-not-exist.txt"),
		).rejects.toThrow();
	});

	it("STREAM FILE - BODY CONTAINS FILE CONTENT", async () => {
		const res = await TC.Response.streamFile("test/fixtures/sample.txt");
		const text = await res.response.text();
		expect(text.length).toBeGreaterThan(0);
	});
});
