import { Status } from "@/CResponse/enums/Status";
import { _corsStore, _prefixStore, _routerStore } from "@/index";
import { CError } from "@/CError/CError";
import { CRequest } from "@/CRequest/CRequest";
import { CResponse } from "@/CResponse/CResponse";
import type { ErrorHandler } from "@/Server/types/ErrorHandler";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { RequestHandler } from "@/Server/types/RequestHandler";
import type { ServeArgs } from "@/Server/types/ServeArgs";
import type { ServerInterface } from "@/Server/ServerInterface";
import type { AfterResponseHandler } from "@/Server/types/AfterResponseHandler";
import { Router } from "@/Router/Router";
import type { Func } from "@/utils/types/Func";
import type { ServerOptions } from "@/Server/types/ServerOptions";

export abstract class ServerAbstract implements ServerInterface {
	abstract serve(options: ServeArgs): void;
	abstract close(): Promise<void>;

	constructor(protected readonly opts?: ServerOptions) {
		_routerStore.set(new Router(opts?.adapter));
	}

	get routes(): Array<[string, string]> {
		return _routerStore.get().getRouteList();
	}

	setGlobalPrefix(value: string): void {
		_prefixStore.set(value);
	}

	async listen(
		port: ServeArgs["port"],
		hostname: ServeArgs["hostname"] = "0.0.0.0",
	): Promise<void> {
		try {
			process.on("SIGINT", () => this.close());
			process.on("SIGTERM", () => this.close());

			console.log(`Listening on ${hostname}:${port}`);

			await this.handleBeforeListen?.();
			this.serve({
				port,
				hostname,
				fetch: (r) => this.handle(r),
			});
		} catch (err) {
			console.error("Server unable to start:", err);
			await this.close();
		}
	}

	async handle(request: Request): Promise<Response> {
		const req = new CRequest(request);
		let res = await this.getResponse(req);
		const cors = _corsStore.get();
		if (cors !== null) {
			cors.apply(req, res);
		}
		if (this.handleAfterResponse) {
			res = await this.handleAfterResponse(res);
		}
		return res.response;
	}

	private async getResponse(req: CRequest): Promise<CResponse> {
		try {
			if (req.isPreflight) {
				return new CResponse("Departed");
			}

			const handler = _routerStore.get().findRouteHandler(req);
			return await handler();
		} catch (err) {
			if (err instanceof CError) {
				if (err.isStatusOf(Status.NOT_FOUND)) {
					return await this.handleNotFound(req);
				}

				if (err.isStatusOf(Status.METHOD_NOT_ALLOWED)) {
					return await this.handleMethodNotAllowed(req);
				}
			}
			return await this.handleError(err as Error);
		}
	}

	protected handleBeforeListen: Func<[], MaybePromise<void>> | undefined;
	setOnBeforeListen(handler: Func<[], MaybePromise<void>> | undefined): void {
		this.handleBeforeListen = handler;
	}
	defaultOnBeforeListen: Func<[], MaybePromise<void>> | undefined = undefined;

	protected handleBeforeClose: Func<[], MaybePromise<void>> | undefined;
	setOnBeforeClose(handler: () => MaybePromise<void>): void {
		this.handleBeforeClose = handler;
	}
	defaultOnBeforeClose: Func<[], MaybePromise<void>> | undefined = undefined;

	protected handleAfterResponse: AfterResponseHandler | undefined;
	setOnAfterResponse(handler: AfterResponseHandler | undefined): void {
		this.handleAfterResponse = handler;
	}
	defaultOnAfterResponse: AfterResponseHandler | undefined = undefined;

	protected handleError: ErrorHandler = (err) => this.defaultErrorHandler(err);
	setOnError(handler: ErrorHandler): void {
		this.handleError = handler;
	}
	defaultErrorHandler: ErrorHandler = (err) => {
		if (!(err instanceof Error)) {
			return new CResponse(
				{ error: err, message: "Unknown" },
				{ status: Status.INTERNAL_SERVER_ERROR },
			);
		}

		if (err instanceof CError) {
			return err.toResponse();
		}
		return new CResponse(
			{ error: err, message: err.message },
			{ status: Status.INTERNAL_SERVER_ERROR },
		);
	};

	protected handleNotFound: RequestHandler = (req) =>
		this.defaultNotFoundHandler(req);
	setOnNotFound(handler: RequestHandler): void {
		this.handleNotFound = handler;
	}
	defaultNotFoundHandler: RequestHandler = (req) => {
		return new CResponse(
			{ error: true, message: `${req.method} on ${req.url} does not exist.` },
			{ status: Status.NOT_FOUND },
		);
	};

	protected handleMethodNotAllowed: RequestHandler = (req) =>
		this.defaultMethodNotFoundHandler(req);
	defaultMethodNotFoundHandler: RequestHandler = (req) => {
		return new CResponse(
			{ error: `${req.method} ${req.url} does not exist.` },
			{ status: Status.METHOD_NOT_ALLOWED },
		);
	};
}
