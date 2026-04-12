import { $registry } from "@/index";
import { Context } from "@/Context/Context";
import { Status } from "@/CResponse/Status";
import { CError } from "@/CError/CError";
import { CRequest } from "@/CRequest/CRequest";
import { CResponse } from "@/CResponse/CResponse";
import type { ErrorHandler } from "@/Server/ErrorHandler";
import type { RequestHandler } from "@/Server/RequestHandler";
import type { ServeArgs } from "@/Server/ServeArgs";
import type { ServerInterface } from "@/Server/ServerInterface";
import { Router } from "@/Registry/Router";
import type { ServerOptions } from "@/Server/ServerOptions";
import { WebSocketRoute } from "@/WebSocketRoute/WebSocketRoute";
import type { RouterData } from "@/Registry/RouterData";
import { RouteVariant } from "@/Route/RouteVariant";
import type { MaybePromise } from "corpus-utils/MaybePromise";
import type { Func } from "corpus-utils/Func";
import { log, logFatal } from "corpus-utils/internalLog";

export abstract class ServerAbstract implements ServerInterface {
	protected abstract serve(options: ServeArgs): void;
	abstract close(closeActiveConnections?: boolean): Promise<void>;

	constructor(protected readonly opts?: ServerOptions) {
		$registry.router = new Router(opts?.adapter);
	}

	get routes(): Array<RouterData> {
		return $registry.router.list();
	}

	setGlobalPrefix(value: string): void {
		$registry.prefix = value;
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
		const ctx = new Context(req);

		// gmw = global middlewares
		const gmw = $registry.middlewares.find("*");

		try {
			const gmwir = await gmw.inbound(ctx);
			if (gmwir instanceof CResponse) {
				return gmwir;
			}
			const match = $registry.router.find(req);

			if (req.isPreflight) {
				ctx.res = await this.handlePreflight(req);
			} else if (!match) {
				ctx.res = await this.handleNotFound(req);
			} else {
				// lmw = local middlewares
				const lmw = $registry.middlewares.find(match.route.id);

				const lmwir = await lmw.inbound(ctx);
				if (lmwir instanceof CResponse) {
					return lmwir;
				}

				await Context.appendParsedData(ctx, req, match);
				const mr = await match.route.handler(ctx);
				if (match.route.variant === RouteVariant.websocket && req.isWebsocket) {
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
		} catch (err) {
			ctx.res = await this.handleError(err as Error);
		}

		await $registry.cors?.handler(ctx);

		return ctx.res;
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
			return err.res;
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

	protected handlePreflight: RequestHandler = async (req) => {
		if (!$registry.cors) {
			return new CResponse(undefined, { status: Status.NO_CONTENT });
		}
		const handler = $registry.cors.getPreflightHandler();
		return await handler(req);
	};
}
