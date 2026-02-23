import { ServerAbstract } from "@/modules/ServerAbstract";
import type { ServeOptions } from "@/types/ServeOptions";
import type { ServerAppUsingBun } from "@/types/ServerAppUsingBun";

export class ServerUsingBun extends ServerAbstract {
	private app: ServerAppUsingBun | undefined;

	serve(options: ServeOptions): void {
		this.app = this.createApp(options);
	}

	async exit(): Promise<void> {
		await this.app?.stop();
		process.exit(0);
	}

	private createApp(options: ServeOptions): ServerAppUsingBun {
		return Bun.serve({
			port: options.port,
			hostname: options.hostname,
			fetch: options.fetch,
		});
	}
}
