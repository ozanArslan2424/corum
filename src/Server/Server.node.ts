import { Config } from "@/Config/Config";
import { CRequest } from "@/CRequest/CRequest";
import { Method } from "@/CRequest/enums/Method";
import { CWebSocketNode } from "@/CWebSocket/CWebSocket.node";
import { ServerAbstract } from "@/Server/ServerAbstract";
import type { ServeArgs } from "@/Server/types/ServeArgs";
import { log } from "@/utils/internalLogger";
import type { WebSocketRoute } from "@/WebSocketRoute/WebSocketRoute";
import http from "node:http";
import https from "node:https";
import type Stream from "node:stream";
import { WebSocketServer } from "ws";

type App =
	| http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
	| https.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;

export default class ServerUsingNode extends ServerAbstract {
	private app: App | undefined;
	private wss: WebSocketServer | undefined;
	private readonly registry = new Map<string, Set<CWebSocketNode>>();

	serve(args: ServeArgs): void {
		const app = this.createApp();
		const wss = this.createWss();

		app.addListener(
			"request",
			async (
				incomingMessage: http.IncomingMessage,
				serverResponse: http.ServerResponse,
			) => {
				const body = await this.getBody(incomingMessage);
				const url = this.getUrl(incomingMessage);
				const method = this.getMethod(incomingMessage);
				const headers = this.getHeaders(incomingMessage);
				const request = this.getRequest(url, method, headers, body);
				const req = new CRequest(request);
				const response = await this.handleRequest(req, () => undefined);
				if (!response) {
					return undefined;
				}

				const data = await this.getData(response);
				serverResponse.statusCode = response.status;
				serverResponse.setHeaders(response.headers);
				serverResponse.end(Buffer.from(data));
			},
		);

		app.addListener(
			"upgrade",
			async (
				incomingMessage: http.IncomingMessage,
				socket: Stream.Duplex,
				head: Buffer,
			) => {
				const body = undefined; // upgrades carry no body
				const url = this.getUrl(incomingMessage);
				const method = this.getMethod(incomingMessage);
				const headers = this.getHeaders(incomingMessage);
				const request = this.getRequest(url, method, headers, body);
				const req = new CRequest(request);

				await this.handleRequest(req, (wsRoute) => {
					if (!wsRoute) {
						socket.destroy();
						return;
					}

					wss.handleUpgrade(incomingMessage, socket, head, async (ws) => {
						const remoteAddress = incomingMessage.socket.remoteAddress ?? "";
						const cws = new CWebSocketNode(ws, this.registry, remoteAddress);

						wss.emit("connection", ws, incomingMessage);

						await wsRoute!.onOpen?.(cws);

						ws.on("message", async (message) => {
							const msg = Buffer.isBuffer(message)
								? message
								: Buffer.from(message as ArrayBuffer);
							await wsRoute!.onMessage(cws, msg);
						});

						ws.on("close", async (code, reason) => {
							cws.cleanup();
							await wsRoute!.onClose?.(cws, code, reason.toString());
						});
					});

					return undefined;
				});
			},
		);

		console.log(app.eventNames());

		this.app = app;
		this.wss = wss;
		app.listen(args.port, args.hostname);
	}

	async close(): Promise<void> {
		await this.handleBeforeClose?.();
		log.log("Closing...");
		this.wss?.close();
		this.app?.close();
		this.app?.closeAllConnections();
		this.app?.closeIdleConnections();
		if (Config.nodeEnv !== "test") {
			process.exit(0);
		}
	}

	private createWss(): WebSocketServer {
		return new WebSocketServer({ noServer: true });
	}

	private createApp(): App {
		return this.opts?.tls
			? https.createServer({
					keepAliveTimeout: this.opts.idleTimeout,
					...this.opts.tls,
				})
			: http.createServer({ keepAliveTimeout: this.opts?.idleTimeout });
	}

	private async getBody(incomingMessage: http.IncomingMessage) {
		let body: Buffer<ArrayBuffer> | undefined = undefined;

		const chunks: Uint8Array[] = [];
		for await (const chunk of incomingMessage) {
			chunks.push(chunk);
		}
		if (chunks.length > 0) {
			body = Buffer.concat(chunks);
		}

		return body;
	}

	private getUrl(incomingMessage: http.IncomingMessage) {
		// Check for proxy headers first (common in production)
		const forwardedProtocol = incomingMessage.headers["x-forwarded-proto"];
		const protocolFromForwarded = Array.isArray(forwardedProtocol)
			? forwardedProtocol[0]
			: forwardedProtocol;

		// Check direct TLS connection
		const socket = incomingMessage.socket as { encrypted?: boolean };
		const isEncrypted = socket.encrypted;

		// Determine protocol
		let protocol: string;
		if (protocolFromForwarded) {
			protocol = `${protocolFromForwarded}://`;
		} else if (isEncrypted) {
			protocol = "https://";
		} else {
			protocol = "http://";
		}

		return `${protocol}${incomingMessage.headers.host}${incomingMessage.url}`;
	}

	private getMethod(incomingMessage: http.IncomingMessage) {
		return incomingMessage.method?.toUpperCase() ?? Method.GET;
	}

	private getHeaders(incomingMessage: http.IncomingMessage) {
		const headers = new Headers();

		for (const [key, value] of Object.entries(incomingMessage.headers)) {
			if (Array.isArray(value)) {
				for (const v of value) headers.append(key, v);
			} else if (value != null && typeof value === "string") {
				headers.append(key, value);
			}
		}

		return headers;
	}

	private getRequest(
		url: string,
		method: string,
		headers: Headers,
		body: Buffer<ArrayBuffer> | undefined,
	) {
		if (method !== Method.GET) {
			return new Request(url, { method, headers, body });
		} else {
			return new Request(url, { method, headers });
		}
	}

	private async getData(response: Response) {
		return await response.arrayBuffer();
	}
}
