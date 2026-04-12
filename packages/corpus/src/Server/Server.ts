import { XConfig } from "@/XConfig/XConfig";
import { CRequest } from "@/CRequest/CRequest";
import { Status } from "@/CResponse/Status";
import { ServerAbstract } from "@/Server/ServerAbstract";
import type { ServeArgs } from "@/Server/ServeArgs";
import { WebSocketRoute } from "@/WebSocketRoute/WebSocketRoute";
import { CError } from "@/CError/CError";
import type { ServerApp } from "@/Server/ServerApp";
import type { ServerWebSocketHandler } from "@/Server/ServerWebSocketHandler";

/**
 * Server is the entrypoint to the app. It must be initialized before registering routes and middlewares.
 * ".listen()" to start listening.
 */

export class Server extends ServerAbstract {
	private app: ServerApp | undefined;

	serve(args: ServeArgs): void {
		this.app = this.createApp(args);
	}

	async close(closeActiveConnections: boolean = true): Promise<void> {
		await this.handleBeforeClose?.();

		await this.app?.stop(closeActiveConnections);

		if (XConfig.nodeEnv !== "test") {
			process.exit(0);
		}
	}

	private createApp(options: ServeArgs): ServerApp {
		return Bun.serve<WebSocketRoute>({
			port: options.port,
			hostname: options.hostname,
			idleTimeout: this.opts?.idleTimeout,
			tls: this.opts?.tls,
			fetch: (r, s) => this.fetch(r, s),
			websocket: this.websocket,
		});
	}

	private async fetch(
		request: Request,
		server: ServerApp,
	): Promise<Response | undefined> {
		const req = new CRequest(request);
		const res = await this.handleRequest(req, (wsRoute) => {
			const upgraded = server.upgrade(request, { data: wsRoute });
			if (!upgraded) {
				throw new CError("Upgrade failed", Status.UPGRADE_REQUIRED);
			}
			return undefined;
		});
		return res?.response;
	}

	private websocket: ServerWebSocketHandler = {
		async open(ws) {
			await ws.data.onOpen?.(ws);
		},
		async message(ws, message) {
			await ws.data.onMessage(ws, message);
		},
		async close(ws, code, reason) {
			await ws.data.onClose?.(ws, code, reason);
		},
	};
}
