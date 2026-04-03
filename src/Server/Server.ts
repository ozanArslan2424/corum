import { XConfig } from "@/XConfig/XConfig";
import { CRequest } from "@/CRequest/CRequest";
import { Status } from "@/CResponse/enums/Status";
import { ServerAbstract } from "@/Server/ServerAbstract";
import type { ServeArgs } from "@/Server/types/ServeArgs";
import { log } from "@/utils/log";
import { WebSocketRoute } from "@/Route/WebSocketRoute";
import { CError } from "@/CError/CError";
import { perform } from "@/utils/perform";

/**
 * Server is the entrypoint to the app. It must be initialized before registering routes and middlewares.
 * ".listen()" to start listening.
 */
type App = Bun.Server<WebSocketRoute>;

export class Server extends ServerAbstract {
	private app: App | undefined;

	serve(args: ServeArgs): void {
		this.app = this.createApp(args);
	}

	async close(closeActiveConnections: boolean = true): Promise<void> {
		await this.handleBeforeClose?.();
		log.log("Closing...");

		await this.app?.stop(closeActiveConnections);

		if (XConfig.nodeEnv !== "test") {
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
		return await perform(async () => {
			const req = new CRequest(request);
			const res = await this.handleRequest(req, (wsRoute) => {
				const upgraded = server.upgrade(request, { data: wsRoute });
				if (!upgraded) {
					throw new CError("Upgrade failed", Status.UPGRADE_REQUIRED);
				}
				return undefined;
			});
			return res?.response;
		}, "fetch");
	}

	private websocket: Bun.WebSocketHandler<WebSocketRoute> = {
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
