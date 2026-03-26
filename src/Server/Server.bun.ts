import { Config } from "@/Config/Config";
import { CRequest } from "@/CRequest/CRequest";
import { Status } from "@/CResponse/enums/Status";
import { ServerAbstract } from "@/Server/ServerAbstract";
import type { ServeArgs } from "@/Server/types/ServeArgs";
import { log } from "@/utils/internalLogger";
import { WebSocketRoute } from "@/WebSocketRoute/WebSocketRoute";
import { CError } from "@/CError/CError";
import { CWebSocketBun } from "@/CWebSocket/CWebSocket.bun";
import type { WebSocketHandler } from "bun";

type App = Bun.Server<WebSocketRoute>;

export default class ServerUsingBun extends ServerAbstract {
	private app: App | undefined;

	serve(args: ServeArgs): void {
		this.app = this.createApp(args);
	}

	async close(): Promise<void> {
		await this.handleBeforeClose?.();
		log.log("Closing...");

		await this.app?.stop(true);

		if (Config.nodeEnv !== "test") {
			process.exit(0);
		}
	}

	private createApp(options: ServeArgs): App {
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
		server: App,
	): Promise<Response | undefined> {
		const req = new CRequest(request);
		return await this.handleRequest(req, (wsRoute) => {
			const upgraded = server.upgrade(request, { data: wsRoute });
			if (!upgraded) {
				throw new CError("Upgrade failed", Status.UPGRADE_REQUIRED);
			}
			return undefined;
		});
	}

	private websocket: WebSocketHandler<WebSocketRoute> = {
		async open(ws) {
			await ws.data.onOpen?.(new CWebSocketBun(ws));
		},
		async message(ws, message) {
			await ws.data.onMessage(new CWebSocketBun(ws), message);
		},
		async close(ws, code, reason) {
			await ws.data.onClose?.(new CWebSocketBun(ws), code, reason);
		},
	};
}
