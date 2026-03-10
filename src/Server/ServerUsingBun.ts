import { Config } from "@/Config/Config";
import { ServerAbstract } from "@/Server/ServerAbstract";
import type { ServeArgs } from "@/Server/types/ServeArgs";

type ServerAppUsingBun = Bun.Server<undefined>;

export class ServerUsingBun extends ServerAbstract {
	private app: ServerAppUsingBun | undefined;

	serve(args: ServeArgs): void {
		this.app = this.createApp(args);
	}

	async close(): Promise<void> {
		await this.handleBeforeClose?.();
		console.log("Closing...");

		await this.app?.stop(true);

		if (Config.nodeEnv !== "test") {
			process.exit(0);
		}
	}

	private createApp(options: ServeArgs): ServerAppUsingBun {
		return Bun.serve({
			port: options.port,
			hostname: options.hostname,
			fetch: options.fetch,
			idleTimeout: this.opts?.idleTimeout,
			tls: this.opts?.tls,
		});
	}
}
