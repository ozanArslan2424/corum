import { describe, expect, it, beforeEach } from "bun:test";
import net from "node:net";

import { TC, TX, $registryTesting } from "./_modules";
import { createTestServer } from "./utils/createTestServer";
import { parseBody } from "./utils/parse";
import { req } from "./utils/req";

beforeEach(() => $registryTesting.reset());

describe("C.Server", () => {
	// ─── handle() - routing ───────────────────────────────────────

	it("HANDLE - RETURNS 200 FOR REGISTERED ROUTE", async () => {
		const s = createTestServer();
		new TC.Route("/srv-200", () => "ok");
		const res = await s.handle(req("/srv-200"));
		expect(res.status).toBe(200);
	});

	it("HANDLE - RETURNS 404 FOR UNREGISTERED ROUTE", async () => {
		const s = createTestServer();
		const res = await s.handle(req("/srv-does-not-exist"));
		expect(res.status).toBe(404);
	});

	it("HANDLE - RETURNS HANDLER RESULT AS BODY", async () => {
		const s = createTestServer();
		new TC.Route("/srv-body", () => ({ hello: "world" }));
		const res = await s.handle(req("/srv-body"));
		const data = await parseBody<{ hello: string }>(res);
		expect(data.hello).toBe("world");
	});

	// ─── preflight ────────────────────────────────────────────────

	it("PREFLIGHT - RETURNS NO_CONTENT", async () => {
		const s = createTestServer();
		const res = await s.handle(
			req("/srv-preflight", {
				method: "OPTIONS",
				headers: { "Access-Control-Request-Method": "POST" },
			}),
		);
		expect(res.status).toBe(TC.Status.NO_CONTENT);
		const body = await res.text();
		expect(body).toBe("");
	});

	// ─── setOnError ───────────────────────────────────────────────

	it("SET ON ERROR - CUSTOM HANDLER IS CALLED ON ERROR", async () => {
		const s = createTestServer();
		s.setOnError(() => {
			return new TC.Res({ error: true, message: "custom error" }, { status: 500 });
		});
		new TC.Route("/srv-error", () => {
			throw new Error("boom");
		});
		const res = await s.handle(req("/srv-error"));
		expect(res.status).toBe(500);
		const data = await parseBody<{ message: string }>(res);
		expect(data.message).toBe("custom error");

		s.setOnError(s.defaultErrorHandler);
	});

	it("SET ON ERROR - DEFAULT HANDLER RETURNS 500", async () => {
		const s = createTestServer();
		new TC.Route("/srv-error-default", () => {
			throw new Error("unexpected");
		});
		const res = await s.handle(req("/srv-error-default"));
		expect(res.status).toBe(500);
	});

	it("SET ON ERROR - HTTP ERROR IS HANDLED BY DEFAULT HANDLER", async () => {
		const s = createTestServer();
		new TC.Route("/srv-httperror", () => {
			throw new TC.Exception("bad input", TC.Status.BAD_REQUEST);
		});
		const res = await s.handle(req("/srv-httperror"));
		expect(res.status).toBe(400);
		const data = await parseBody<{ message: string }>(res);
		expect(data.message).toBe("bad input");
	});

	// ─── setOnNotFound ────────────────────────────────────────────

	it("SET ON NOT FOUND - CUSTOM HANDLER IS CALLED", async () => {
		const s = createTestServer();
		s.setOnNotFound(() => {
			return new TC.Res({ error: true, message: "custom not found" }, { status: 404 });
		});
		const res = await s.handle(req("/srv-custom-404"));
		expect(res.status).toBe(404);
		const data = await parseBody<{ message: string }>(res);
		expect(data.message).toBe("custom not found");

		s.setOnNotFound(s.defaultNotFoundHandler);
	});

	it("SET ON NOT FOUND - DEFAULT HANDLER INCLUDES METHOD AND URL", async () => {
		const s = createTestServer();
		const res = await s.handle(req("/srv-default-404"));
		expect(res.status).toBe(404);
		const data = await parseBody<{ message: string }>(res);
		expect(data.message).toContain("GET");
		expect(data.message).toContain("/srv-default-404");
	});

	// ─── setGlobalPrefix ──────────────────────────────────────────

	it("SET GLOBAL PREFIX - ROUTE IS ACCESSIBLE UNDER PREFIX", async () => {
		const s = createTestServer();
		s.setGlobalPrefix("/api");
		new TC.Route("/srv-prefixed", () => "prefixed");
		const res = await s.handle(req("/srv-prefixed"));
		expect(res.status).toBe(200);
		s.setGlobalPrefix("");
	});

	it("SET GLOBAL PREFIX - ROUTE IS NOT ACCESSIBLE WITHOUT PREFIX", async () => {
		const s = createTestServer();
		s.setGlobalPrefix("/api");
		new TC.Route("/srv-no-prefix", () => "ok");
		const res = await s.handle(new Request("http://localhost:4444/srv-no-prefix"));
		expect(res.status).toBe(404);
		s.setGlobalPrefix("");
	});

	// ─── CORS integration ─────────────────────────────────────────

	it("CORS - SETS ORIGIN HEADER ON ALLOWED ORIGIN", async () => {
		const s = createTestServer();
		new TX.Cors({ allowedOrigins: ["https://example.com"] });
		new TC.Route("/srv-cors", () => "ok");
		const res = await s.handle(req("/srv-cors", { headers: { origin: "https://example.com" } }));
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
		new TX.Cors(undefined);
	});

	it("CORS - DOES NOT SET ORIGIN HEADER ON DISALLOWED ORIGIN", async () => {
		const s = createTestServer();
		new TX.Cors({ allowedOrigins: ["https://example.com"] });
		new TC.Route("/srv-cors-blocked", () => "ok");
		const res = await s.handle(
			req("/srv-cors-blocked", { headers: { origin: "https://evil.com" } }),
		);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
		new TX.Cors(undefined);
	});

	it("CORS - IS NOT APPLIED WHEN NOT SET", async () => {
		const s = createTestServer();
		new TC.Route("/srv-no-cors", () => "ok");
		const res = await s.handle(req("/srv-no-cors", { headers: { origin: "https://example.com" } }));
		expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});

	it("IDLE TIMEOUT - CLOSES IDLE KEEP-ALIVE CONNECTION", async () => {
		const s = createTestServer({ idleTimeout: 1 });
		new TC.Route("/idle-timeout-test", () => "ok");
		const PORT = 4481;
		const HOST = "localhost";

		function rawRequest(path: string): string {
			return [
				`GET ${path} HTTP/1.1`,
				`Host: ${HOST}:${PORT}`,
				"Connection: keep-alive",
				"",
				"",
			].join("\r\n");
		}

		function send(socket: net.Socket, data: string): Promise<string> {
			return new Promise((resolve, reject) => {
				socket.once("data", (chunk) => resolve(chunk.toString()));
				socket.once("error", reject);
				socket.write(data);
			});
		}

		function waitForClose(socket: net.Socket): Promise<void> {
			return new Promise((resolve) => {
				socket.once("close", resolve);
				socket.once("end", () => socket.destroy());
			});
		}

		await s.listen(PORT, HOST);

		let error: unknown;
		try {
			const socket = net.connect(PORT, HOST);
			await new Promise<void>((resolve, reject) => {
				socket.once("connect", resolve);
				socket.once("error", reject);
			});

			// First request — establishes the keep-alive connection
			await send(socket, rawRequest("/idle-timeout-test"));

			// Wait well past the idle timeout
			await Bun.sleep(200);

			// Try to send a second request on the same socket
			// The server should have closed it by now
			const closePromise = waitForClose(socket);
			socket.write(rawRequest("/idle-timeout-test"));

			// Either the socket is already closed or will close immediately
			await Promise.race([
				closePromise,
				Bun.sleep(500).then(() => {
					throw new Error("Socket was not closed by idle timeout");
				}),
			]);
		} catch (err) {
			error = err;
		} finally {
			await s.close();
		}
		expect(error).toBeDefined();
	});
});
