import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { RouterData } from "@/Registry/RouterData";
import type { ErrorHandler } from "@/Server/ErrorHandler";
import type { RequestHandler } from "@/Server/RequestHandler";
import type { ServerOpenArgs } from "@/Server/ServerOpenArgs";

export interface ServerInterface {
	get routes(): Array<RouterData>;

	setGlobalPrefix(value: string): void;

	listen(port: ServerOpenArgs["port"], hostname?: ServerOpenArgs["hostname"]): Promise<void>;

	close(closeActiveConnections?: boolean): Promise<void>;

	handle(request: Request): Promise<Response>;

	/**
	 *
	 * Default error handler response will have a status of C.Error or 500 and json:
	 *
	 * ```typescript
	 * { error: unknown | true, message: string }
	 * ```
	 *
	 * If throw something other than an Error instance, you should probably handle it.
	 * However the default response will have a status of 500 and json:
	 *
	 * ```typescript
	 * { error: Instance, message: "Unknown" }
	 * ```
	 */
	setOnError(handler: ErrorHandler): void;
	defaultErrorHandler: ErrorHandler;

	/**
	 *
	 * Default not found handler response will have a status of 404 and json:
	 *
	 * ```typescript
	 * { error: true, message: `${req.method} on ${req.url} does not exist.` }
	 * ```
	 */
	setOnNotFound(handler: RequestHandler): void;
	defaultNotFoundHandler: RequestHandler;

	setOnBeforeListen(handler: Func<[], MaybePromise<void>> | undefined): void;
	defaultOnBeforeListen: Func<[], MaybePromise<void>> | undefined;

	setOnBeforeClose(handler: () => MaybePromise<void>): void;
	defaultOnBeforeClose: Func<[], MaybePromise<void>> | undefined;
}
