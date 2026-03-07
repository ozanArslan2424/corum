import { Status } from "@/Response/enums/Status";
import { _globalPrefix, _router } from "@/index";
import { Cors } from "@/Cors/Cors";
import { HttpError } from "@/Error/HttpError";
import { HttpRequest } from "@/Request/HttpRequest";
import { HttpResponse } from "@/Response/HttpResponse";
import type { CorsOptions } from "@/Cors/types/CorsOptions";
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

	constructor(opts?: ServerOptions) {
		_router.set(new Router(opts?.adapter));
	}

	get routes(): Array<[string, string]> {
		return _router.get().getRouteList();
	}

	setGlobalPrefix(value: string): void {
		_globalPrefix.set(value);
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
		const req = new HttpRequest(request);
		let res = await this.getResponse(req);
		if (this.cors !== undefined) {
			this.cors.apply(req, res);
		}
		if (this.handleAfterResponse) {
			res = await this.handleAfterResponse(res);
		}
		return res.response;
	}

	private async getResponse(req: HttpRequest): Promise<HttpResponse> {
		try {
			if (req.isPreflight) {
				return new HttpResponse("Departed");
			}

			const handler = _router.get().findRouteHandler(req);
			return await handler();
		} catch (err) {
			if (err instanceof HttpError) {
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

	protected cors: Cors | undefined;
	setCors(opts: CorsOptions | undefined): void {
		this.cors = opts ? new Cors(opts) : undefined;
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
			return new HttpResponse(
				{ error: err, message: "Unknown" },
				{ status: Status.INTERNAL_SERVER_ERROR },
			);
		}

		if (err instanceof HttpError) {
			return err.toResponse();
		}
		return new HttpResponse(
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
		return new HttpResponse(
			{ error: true, message: `${req.method} on ${req.url} does not exist.` },
			{ status: Status.NOT_FOUND },
		);
	};

	protected handleMethodNotAllowed: RequestHandler = (req) =>
		this.defaultMethodNotFoundHandler(req);
	defaultMethodNotFoundHandler: RequestHandler = (req) => {
		return new HttpResponse(
			{ error: `${req.method} ${req.url} does not exist.` },
			{ status: Status.METHOD_NOT_ALLOWED },
		);
	};
}
