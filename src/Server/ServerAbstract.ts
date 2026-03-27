import { Context } from "@/Context/Context";
import { Status } from "@/CResponse/enums/Status";
import { $prefixStore, $routerStore } from "@/index";
import { CError } from "@/CError/CError";
import { CRequest } from "@/CRequest/CRequest";
import { CResponse } from "@/CResponse/CResponse";
import type { ErrorHandler } from "@/Server/types/ErrorHandler";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { RequestHandler } from "@/Server/types/RequestHandler";
import type { ServeArgs } from "@/Server/types/ServeArgs";
import type { ServerInterface } from "@/Server/ServerInterface";
import { Router } from "@/Router/Router";
import type { Func } from "@/utils/types/Func";
import type { ServerOptions } from "@/Server/types/ServerOptions";
import { log, logFatal } from "@/utils/internalLogger";
import { WebSocketRoute } from "@/Route/WebSocketRoute";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export abstract class ServerAbstract implements ServerInterface {
	protected abstract serve(options: ServeArgs): void;
	abstract close(closeActiveConnections?: boolean): Promise<void>;

	constructor(protected readonly opts?: ServerOptions) {
		$routerStore.set(new Router(opts?.adapter));
	}

	get routes(): Array<RouterRouteData> {
		return $routerStore.get().getRouteList();
	}

	setGlobalPrefix(value: string): void {
		$prefixStore.set(value);
	}

	async listen(
		port: ServeArgs["port"],
		hostname: ServeArgs["hostname"] = "0.0.0.0",
	): Promise<void> {
		try {
			process.on("SIGINT", () => this.close());
			process.on("SIGTERM", () => this.close());

			log.log(`Listening on ${hostname}:${port}`);

			await this.handleBeforeListen?.();
			this.serve({
				port,
				hostname,
			});
		} catch (err) {
			log.error("Server unable to start:", err);
			await this.close();
		}
	}

	async handle(request: Request): Promise<Response> {
		const req = new CRequest(request);
		const handled = await this.handleRequest(req, () => undefined);
		if (!handled) {
			logFatal("WebSocket requests cannot be handled with this method.");
		}
		return handled.response;
	}

	protected async handleRequest(
		req: CRequest,
		onUpgrade: Func<[WebSocketRoute], undefined>,
	): Promise<CResponse | undefined> {
		try {
			if (req.isPreflight) {
				return await this.handlePreflight(req);
			}

			const router = $routerStore.get();
			const ctx = Context.makeFromRequest(req);
			// gmw = global middlewares
			const gmw = router.findMiddleware("*");

			const gmwir = await gmw.inbound(ctx);
			if (gmwir instanceof CResponse) {
				return gmwir;
			}

			const match = router.findRoute(req);
			if (!match) {
				ctx.res = await this.handleNotFound(req);
			} else {
				// lmw = local middlewares
				const lmw = router.findMiddleware(match.route.id);

				const lmwir = await lmw.inbound(ctx);
				if (lmwir instanceof CResponse) {
					return lmwir;
				}

				await Context.appendParsedData(ctx, req, match);
				const mr = await match.route.handler(ctx);
				if (mr instanceof WebSocketRoute && req.isWebsocket) {
					return onUpgrade(mr);
				} else if (mr instanceof CResponse) {
					ctx.res = mr;
				} else {
					ctx.res = new CResponse(mr, ctx.res);
				}

				const lmwor = await lmw.outbound(ctx);
				if (lmwor instanceof CResponse) {
					return lmwor;
				}
			}

			const gmwor = await gmw.outbound(ctx);
			if (gmwor instanceof CResponse) {
				return gmwor;
			}

			return ctx.res;
		} catch (err) {
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

	protected handleError: ErrorHandler = (err) => this.defaultErrorHandler(err);
	setOnError(handler: ErrorHandler): void {
		this.handleError = handler;
	}
	defaultErrorHandler: ErrorHandler = (err) => {
		if (err instanceof CError) {
			return err.toResponse();
		}

		return new CResponse(
			{ error: err, message: "message" in err ? err.message : "Unknown" },
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

	protected handlePreflight: RequestHandler = (req) =>
		this.defaultPreflightHandler(req);
	setOnPreflight(handler: RequestHandler): void {
		this.handlePreflight = handler;
	}
	defaultPreflightHandler: RequestHandler = () => {
		return new CResponse("Departed");
	};
}
