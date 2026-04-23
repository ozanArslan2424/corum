import type { Func } from "corpus-utils/Func";
import { log, logFatal } from "corpus-utils/internalLog";
import type { MaybePromise } from "corpus-utils/MaybePromise";
import type { OrString } from "corpus-utils/OrString";

import { RouteVariant } from "@/BaseRoute/RouteVariant";
import { Context } from "@/Context/Context";
import { Exception } from "@/Exception/Exception";
import { $registry } from "@/index";
import { BodyParser } from "@/Parser/BodyParser";
import { FormDataParser } from "@/Parser/FormDataParser";
import { SearchParamsParser } from "@/Parser/SearchParamsParser";
import { URLParamsParser } from "@/Parser/URLParamsParser";
import { Router } from "@/Registry/Router";
import type { RouterData } from "@/Registry/RouterData";
import { Req } from "@/Req/Req";
import { Res } from "@/Res/Res";
import type { ErrorHandler } from "@/Server/ErrorHandler";
import type { RequestHandler } from "@/Server/RequestHandler";
import type { ServerApp } from "@/Server/ServerApp";
import type { ServerInterface } from "@/Server/ServerInterface";
import type { ServerOptions } from "@/Server/ServerOptions";
import { Status } from "@/Status/Status";
import { WebSocketRoute } from "@/WebSocketRoute/WebSocketRoute";
import { XConfig } from "@/XConfig/XConfig";

/**
 * Server is the entrypoint to the app. It must be initialized before registering routes and middlewares.
 * ".listen()" to start listening.
 */

export class Server implements ServerInterface {
	constructor(protected readonly opts?: ServerOptions) {
		$registry.router = new Router(opts?.adapter);
		this.urlParamsParser = new URLParamsParser();
		this.searchParamsParser = new SearchParamsParser();
		this.formDataParser = new FormDataParser();
		this.bodyParser = new BodyParser(this.formDataParser, this.searchParamsParser);
	}

	protected app: ServerApp | undefined;
	protected readonly urlParamsParser: URLParamsParser;
	protected readonly searchParamsParser: SearchParamsParser;
	protected readonly formDataParser: FormDataParser;
	protected readonly bodyParser: BodyParser;

	get routes(): Array<RouterData> {
		return $registry.router.list();
	}

	setGlobalPrefix(value: string): void {
		$registry.prefix = value;
	}

	async listen(
		port: number,
		hostname?: OrString<"0.0.0.0" | "127.0.0.1" | "localhost">,
	): Promise<void> {
		try {
			process.on("SIGINT", () => this.close());
			process.on("SIGTERM", () => this.close());
			log.log(`Listening on ${hostname}:${port}`);

			await this.handleBeforeListen?.();

			this.app = Bun.serve<WebSocketRoute>({
				port,
				hostname,
				idleTimeout: this.opts?.idleTimeout,
				tls: this.opts?.tls,
				fetch: (r, s) => this.fetch(r, s),
				websocket: {
					async open(ws) {
						await ws.data.onOpen?.(ws);
					},
					async message(ws, message) {
						await ws.data.onMessage(ws, message);
					},
					async close(ws, code, reason) {
						await ws.data.onClose?.(ws, code, reason);
					},
				},
			});
		} catch (err) {
			log.error("Server unable to start:", err);
			await this.close();
		}
	}

	async close(closeActiveConnections: boolean = true): Promise<void> {
		await this.handleBeforeClose?.();
		await this.app?.stop(closeActiveConnections);
		if (XConfig.nodeEnv !== "test") {
			process.exit(0);
		}
	}

	// Undefined runs the websocket callback
	protected async fetch(request: Request, server: ServerApp): Promise<Response | undefined> {
		const req = new Req(request);
		const res = await this.handleRequest(req, (wsRoute) => {
			const upgraded = server.upgrade(request, { data: wsRoute });
			if (!upgraded) {
				throw new Exception("Upgrade failed", Status.UPGRADE_REQUIRED);
			}
			return null;
		});
		return res?.response;
	}

	async handle(request: Request): Promise<Response> {
		const req = new Req(request);
		const res = await this.handleRequest(req, () => null);
		if (!res) {
			logFatal("WebSocket requests cannot be handled with this method.");
		}
		return res.response;
	}

	// gmw: global middlewares
	// gmwir: global middlewares inbound result
	// gmwor: global middlewares outbound result
	// lmw: local middlewares
	// lmwir: local middlewares inbound result
	// lmwor: local middlewares outbound result
	protected async handleRequest(
		req: Req,
		onUpgrade: Func<[WebSocketRoute], null>,
	): Promise<Res | null> {
		const ctx = new Context(req);

		const gmw = $registry.middlewares.find("*");

		try {
			const gmwir = await gmw.inbound(ctx);
			if (gmwir instanceof Res) return gmwir;

			const match = $registry.router.find(req);

			if (req.isPreflight) {
				ctx.res = await this.handlePreflight(req);
			} else if (!match) {
				ctx.res = await this.handleNotFound(req);
			} else {
				const lmw = $registry.middlewares.find(match.route.id);

				const lmwir = await lmw.inbound(ctx);
				if (lmwir instanceof Res) return lmwir;

				await Context.appendParsedData(
					ctx,
					req,
					match,
					this.urlParamsParser,
					this.searchParamsParser,
					this.bodyParser,
				);

				const routeResult = await match.route.handler(ctx);

				if (match.route.variant === RouteVariant.websocket && req.isWebsocket) {
					return onUpgrade(routeResult);
				} else if (routeResult instanceof Res) {
					ctx.res = routeResult;
				} else {
					ctx.res = new Res(routeResult, ctx.res);
				}

				const lmwor = await lmw.outbound(ctx);
				if (lmwor instanceof Res) return lmwor;
			}

			const gmwor = await gmw.outbound(ctx);
			if (gmwor instanceof Res) return gmwor;
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
		if (err instanceof Exception) {
			return err.response;
		}

		return new Res(
			{ error: err, message: "message" in err ? err.message : "Unknown" },
			{ status: Status.INTERNAL_SERVER_ERROR },
		);
	};

	protected handleNotFound: RequestHandler = (req) => this.defaultNotFoundHandler(req);
	setOnNotFound(handler: RequestHandler): void {
		this.handleNotFound = handler;
	}
	defaultNotFoundHandler: RequestHandler = (req) => {
		return new Res(
			{ error: true, message: `${req.method} on ${req.url} does not exist.` },
			{ status: Status.NOT_FOUND },
		);
	};

	protected handlePreflight: RequestHandler = async (req) => {
		if (!$registry.cors) {
			return new Res(undefined, { status: Status.NO_CONTENT });
		}
		const handler = $registry.cors.getPreflightHandler();
		return handler(req);
	};
}
