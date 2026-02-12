import { Status } from "@/internal/enums/Status";
import { makeLogger } from "@/internal/modules/Logger/LoggerClass";
import type { ServerInterface } from "@/internal/modules/Server/ServerInterface";
import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";
import type { HttpResponseInterface } from "@/internal/modules/HttpResponse/HttpResponseInterface";
import { HttpError } from "@/internal/modules/HttpError/HttpError";
import { HttpRequest } from "@/internal/modules/HttpRequest/HttpRequest";
import { HttpResponse } from "@/internal/modules/HttpResponse/HttpResponse";
import type { HttpResponseBody } from "@/internal/modules/HttpResponse/types/HttpResponseBody";
import type { RequestHandler } from "@/internal/modules/Server/types/RequestHandler";
import type { ServeOptions } from "@/internal/modules/Server/types/ServeOptions";
import type { CorsInterface } from "@/internal/modules/Cors/CorsInterface";
import type { RouterInterface } from "@/internal/modules/Router/RouterInterface";
import { Router } from "@/internal/modules/Router/Router";
import type { ErrorHandler } from "@/internal/modules/Server/types/ErrorHandler";
import { RouteContext } from "@/internal/modules/RouteContext/RouteContext";
import { Cors } from "@/internal/modules/Cors/Cors";
import type { CorsOptions } from "@/internal/modules/Cors/types/CorsOptions";
import type { MaybePromise } from "@/internal/utils/MaybePromise";

export abstract class ServerAbstract implements ServerInterface {
	abstract serve(options: ServeOptions): void;
	abstract close(): Promise<void>;

	protected readonly logger = makeLogger("Http");
	readonly router: RouterInterface = new Router();
	protected cors: CorsInterface | undefined;
	handleBeforeListen: (() => MaybePromise<void>) | undefined = undefined;
	handleBeforeClose: (() => MaybePromise<void>) | undefined = undefined;

	setGlobalPrefix(value: string): void {
		this.router.globalPrefix = value;
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

	setOnBeforeExit(handler: () => MaybePromise<void>): void {
		this.handleBeforeClose = handler;
	}

	setOnBeforeListen(handler: () => MaybePromise<void>): void {
		this.handleBeforeListen = handler;
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
			this.logger.error("Server unable to start:", err);
			this.handleBeforeClose?.();
			await this.close();
		}
	}

	async handle(request: Request): Promise<Response> {
		const req = new HttpRequest(request);
		const res = await this.getResponse(req);
		if (this.cors !== undefined) {
			this.cors.apply(req, res);
		}
		return res.response;
	}

	private async prepare(
		port: ServeOptions["port"],
		hostname: ServeOptions["hostname"],
	) {
		process.on("SIGINT", () => this.close());
		process.on("SIGTERM", () => this.close());
		this.logger.log(`Listening on ${hostname}:${port}`);
		this.logger.log(
			"\n" +
				this.router
					.getRoutes()
					.map((r) => `[${r.method}]\t:\t${r.path}`)
					.join("\n"),
		);
	}

	private handleError: ErrorHandler = async (err) => {
		let body: HttpResponseBody = err;
		let status: number = Status.INTERNAL_SERVER_ERROR;

		if (err instanceof HttpError) {
			body = err.data ?? err.message;
			status = err.status;
		}

		return new HttpResponse(body, { status });
	};

	private handleNotFound: RequestHandler = async (req) => {
		return new HttpResponse(`${req.method} on ${req.url} does not exist.`, {
			status: Status.NOT_FOUND,
		});
	};

	private handleMethodNotAllowed: RequestHandler = async (req) => {
		return new HttpResponse(`${req.method} does not exist.`, {
			status: Status.METHOD_NOT_ALLOWED,
		});
	};

	private handlePreflight = async () => {
		return new HttpResponse("Departed");
	};

	private handleRoute: RequestHandler = async (req) => {
		const route = this.router.findRoute(req.url, req.method);
		const ctx = await RouteContext.makeFromRequest(
			req,
			route.path,
			route.schemas,
		);
		const returnData = await route.handler(ctx);
		if (returnData instanceof HttpResponse) {
			return returnData;
		}

		return new HttpResponse(returnData, {
			status: ctx.res.status,
			statusText: ctx.res.statusText,
			headers: ctx.res.headers,
			cookies: ctx.res.cookies,
		});
	};

	private async getResponse(
		req: HttpRequestInterface,
	): Promise<HttpResponseInterface> {
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
