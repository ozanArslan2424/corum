import type { ServerInterface } from "@/modules/Server/ServerInterface";
import { ServerAbstract } from "@/modules/Server/ServerAbstract";
import { RuntimeOptions } from "@/modules/Runtime/enums/RuntimeOptions";
import { ServerUsingBun } from "@/modules/Server/ServerUsingBun";
import { ServerUsingNode } from "@/modules/Server/ServerUsingNode";
import type { ServeOptions } from "@/modules/Server/types/ServeOptions";
import { getRuntime } from "@/modules/Runtime/getRuntime";
import { setServerInstance } from "@/modules/Server/ServerInstance";

/**
 * Server is the entrypoint to the app.
 * It takes the routes, controllers, middlewares, and HTML bundles for static pages.
 * A router instance must be passed to a {@link Server} to start listening.
 * At least one controller is required for middlewares to work.
 * You can pass a {@link DatabaseClientInterface} instance to connect and disconnect.
 * You can pass your {@link Cors} object.
 * */

export class Server extends ServerAbstract implements ServerInterface {
	constructor() {
		super();
		this.instance = this.getInstance();
		setServerInstance(this);
	}

	serve(options: ServeOptions): void {
		return this.instance.serve(options);
	}

	async exit(): Promise<void> {
		await this.handleBeforeExit?.();
		return await this.instance.exit();
	}

	private instance: ServerInterface;

	private getInstance(): ServerInterface {
		const runtime = getRuntime();

		switch (runtime) {
			case RuntimeOptions.bun:
				return new ServerUsingBun();
			case RuntimeOptions.node:
				return new ServerUsingNode();
			default:
				throw new Error(`Unsupported runtime: ${runtime}`);
		}
	}
}
