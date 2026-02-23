import { _globalPrefixEnvKey } from "@/constants/_globalPrefixEnvKey";
import { Status } from "@/enums/Status";
import { getRouterInstance } from "@/index";
import { Config } from "@/modules/Config";
import { Cors } from "@/modules/Cors";
import { HttpError } from "@/modules/HttpError";
import { HttpRequest } from "@/modules/HttpRequest";
import { HttpResponse } from "@/modules/HttpResponse";
import type { CorsOptions } from "@/types/CorsOptions";
import type { ErrorHandler } from "@/types/ErrorHandler";
import type { HttpResponseBody } from "@/types/HttpResponseBody";
import type { MaybePromise } from "@/types/MaybePromise";
import type { RequestHandler } from "@/types/RequestHandler";
import type { ServeOptions } from "@/types/ServeOptions";

export abstract class ServerAbstract {
	abstract serve(options: ServeOptions): void;
	abstract exit(): Promise<void>;

	protected cors: Cors | undefined;
	protected handleBeforeListen: (() => MaybePromise<void>) | undefined;
	protected handleBeforeExit: (() => MaybePromise<void>) | undefined;
	protected handleAfterResponse:
		| ((res: HttpResponse) => MaybePromise<HttpResponse>)
		| undefined;

	setGlobalPrefix(value: string): void {
		Config.set(_globalPrefixEnvKey, value);
	}

	setCors(cors: CorsOptions): void {
		this.cors = new Cors(cors);
	}

	setOnError(handler: ErrorHandler): void {
		this.handleError = handler;
	}

	setOnNotFound(handler: RequestHandler): void {
		this.handleNotFound = handler;
	}

	setOnBeforeListen(handler: () => MaybePromise<void>): void {
		this.handleBeforeListen = handler;
	}

	setOnBeforeExit(handler: () => MaybePromise<void>): void {
		this.handleBeforeExit = handler;
	}

	setOnAfterResponse(
		handler: (res: HttpResponse) => MaybePromise<HttpResponse>,
	): void {
		this.handleAfterResponse = handler;
	}

	async listen(
		port: ServeOptions["port"],
		hostname: ServeOptions["hostname"] = "0.0.0.0",
	): Promise<void> {
		try {
			await this.prepare(port, hostname);
			await this.handleBeforeListen?.();
			this.serve({
				port,
				hostname,
				fetch: (r) => this.handle(r),
			});
		} catch (err) {
			console.error("Server unable to start:", err);
			await this.exit();
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

	private async prepare(
		port: ServeOptions["port"],
		hostname: ServeOptions["hostname"],
	) {
		process.on("SIGINT", () => this.exit());
		process.on("SIGTERM", () => this.exit());
		const routes = getRouterInstance().getRouteList();
		console.log(`Listening on ${hostname}:${port}\n${routes}`);
	}

	private handleError: ErrorHandler = async (err) => {
		let body: HttpResponseBody = err;
		let status: number = Status.INTERNAL_SERVER_ERROR;

		if (err instanceof HttpError) {
			body = err.data ?? err.message;
			status = err.status;
		}

		return new HttpResponse({ error: body }, { status });
	};

	private handleNotFound: RequestHandler = async (req) => {
		return new HttpResponse(
			{ error: `${req.method} on ${req.url} does not exist.` },
			{ status: Status.NOT_FOUND },
		);
	};

	private handleMethodNotAllowed: RequestHandler = async (req) => {
		return new HttpResponse(
			{ error: `${req.method} does not exist.` },
			{ status: Status.METHOD_NOT_ALLOWED },
		);
	};

	private handlePreflight = async () => {
		return new HttpResponse("Departed");
	};

	private handleRoute: RequestHandler = async (req) => {
		const handler = getRouterInstance().getRouteHandler(req);
		return await handler();
	};

	private async getResponse(req: HttpRequest): Promise<HttpResponse> {
		try {
			if (req.isPreflight) {
				return await this.handlePreflight();
			}

			return await this.handleRoute(req);
		} catch (err) {
			if (HttpError.isStatusOf(err, Status.NOT_FOUND)) {
				return await this.handleNotFound(req);
			}

			if (HttpError.isStatusOf(err, Status.METHOD_NOT_ALLOWED)) {
				return await this.handleMethodNotAllowed(req);
			}

			return await this.handleError(err as Error);
		}
	}
}
