import type { ErrorHandler } from "@/Server/types/ErrorHandler";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { RequestHandler } from "@/Server/types/RequestHandler";
import type { ServeArgs } from "@/Server/types/ServeArgs";
import type { Func } from "@/utils/types/Func";

export interface ServerInterface {
	serve(options: ServeArgs): void;

	close(): Promise<void>;

	get routes(): Array<[string, string]>;

	setGlobalPrefix(value: string): void;

	listen(
		port: ServeArgs["port"],
		hostname?: ServeArgs["hostname"],
	): Promise<void>;

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

	setOnPreflight(handler: RequestHandler): void;
	defaultPreflightHandler: RequestHandler;
}
