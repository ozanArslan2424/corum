import type { ServerInterface } from "@/internal/modules/Server/ServerInterface";
import { ServerAbstract } from "@/internal/modules/Server/ServerAbstract";
import { RuntimeOptions } from "@/internal/enums/RuntimeOptions";
import { ServerUsingBun } from "@/internal/modules/Server/ServerUsingBun";
import { ServerUsingNode } from "@/internal/modules/Server/ServerUsingNode";
import type { ServeOptions } from "@/internal/modules/Server/types/ServeOptions";
import { getRuntime } from "@/internal/modules/Server/getRuntime";
import { setServerInstance } from "@/internal/modules/Server/ServerInstance";

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

	async close(): Promise<void> {
		return await this.instance.close();
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
