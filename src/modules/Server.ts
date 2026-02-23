import { setRouterInstance } from "@/index";
import { Router } from "@/modules/Router";
import { ServerAbstract } from "@/modules/ServerAbstract";
import { ServerUsingBun } from "@/modules/ServerUsingBun";
import type { ServeOptions } from "@/types/ServeOptions";

/**
 * Server is the entrypoint to the app. It must be initialized before registering routes and middlewares.
 * ".listen()" to start listening.
 */

// TODO: Node support
export class Server extends ServerAbstract {
	private instance = new ServerUsingBun();

	constructor() {
		super();
		setRouterInstance(new Router());
	}

	serve(options: ServeOptions): void {
		return this.instance.serve(options);
	}

	async exit(): Promise<void> {
		await this.handleBeforeExit?.();
		return await this.instance.exit();
	}
}
