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
import type { RouteId } from "@/Route/types/RouteId";

export abstract class ServerAbstract implements ServerInterface {
	abstract serve(options: ServeArgs): void;
	abstract close(): Promise<void>;

	constructor(protected readonly opts?: ServerOptions) {
		$routerStore.set(new Router(opts?.adapter));
	}

	get routes(): Array<[string, string]> {
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

	async handleRequest(
		req: CRequest,
		onUpgrade: Func<[WebSocketRoute], undefined>,
	): Promise<CResponse | undefined> {
		try {
			if (req.isPreflight) {
				return await this.handlePreflight(req);
			}

			const res = await this.handleMiddleware(
				Context.makeFromRequest(req),
				"*",
				async (ctx1) => {
					const match = $routerStore.get().findRoute(req);
					if (!match) {
						return await this.handleNotFound(req);
					} else {
						return await this.handleMiddleware(
							ctx1,
							match.route.id,
							async (ctx2) => {
								await Context.appendParsedData(ctx2, req, match);
								const result = await match.route.handler(ctx2);
								if (result instanceof WebSocketRoute && req.isWebsocket) {
									// ws requests return undefined
									return onUpgrade(result);
								} else if (result instanceof CResponse) {
									return result;
								} else {
									return new CResponse(result, ctx2.res);
								}
							},
						);
					}
				},
			);

			return res;
		} catch (err) {
			return await this.handleError(err as Error);
		}
	}

	// async handleRequest(
	// 	req: CRequest,
	// 	onUpgrade: Func<[WebSocketRoute], undefined>,
	// ): Promise<CResponse | undefined> {
	// 	try {
	// 		if (req.isPreflight) {
	// 			log.debug("returned on req.isPreflight");
	// 			return await this.handlePreflight(req);
	// 		}
	//
	// 		const router = $routerStore.get();
	//
	// 		const ctx = Context.makeFromRequest(req);
	//
	// 		// gmw = global middlewares
	// 		const gmw = router.findMiddleware("*");
	// 		const gmwInboundResult = await gmw.inbound(ctx);
	// 		if (gmwInboundResult instanceof CResponse) {
	// 			log.debug("returned on gmwInboundResult");
	// 			return gmwInboundResult;
	// 		}
	//
	// 		const match = router.findRoute(req);
	// 		if (!match) {
	// 			log.debug("res from not found");
	// 			ctx.res = await this.handleNotFound(req);
	// 		} else {
	// 			// lmw = local middlewares
	// 			const lmw = router.findMiddleware(match.route.id);
	//
	// 			const lmwInboundResult = await lmw.inbound(ctx);
	// 			if (lmwInboundResult instanceof CResponse) {
	// 				log.debug("returned on lmwInboundResult");
	// 				return lmwInboundResult;
	// 			}
	//
	// 			await Context.appendParsedData(ctx, req, match);
	// 			const result = await match.route.handler(ctx);
	// 			if (result instanceof WebSocketRoute && req.isWebsocket) {
	// 				// ws requests return undefined
	// 				log.debug("returned on onUpgrade");
	// 				return onUpgrade(result);
	// 			} else {
	// 				log.debug("res from route");
	// 				ctx.res =
	// 					result instanceof CResponse
	// 						? result
	// 						: new CResponse(result, ctx.res);
	// 			}
	//
	// 			const lmwOutboundResult = await lmw.outbound(ctx);
	// 			if (lmwOutboundResult instanceof CResponse) {
	// 				log.debug("returned on lmwOutboundResult");
	// 				return lmwOutboundResult;
	// 			}
	// 		}
	//
	// 		const gmwOutboundResult = await gmw.outbound(ctx);
	// 		if (gmwOutboundResult instanceof CResponse) {
	// 			log.debug("returned on gmwOutboundResult");
	// 			return gmwOutboundResult;
	// 		}
	//
	// 		return ctx.res;
	// 	} catch (err) {
	// 		log.debug("returned on handleError");
	// 		return await this.handleError(err as Error);
	// 	}
	// }
	//
	protected async handleMiddleware(
		ctx: Context,
		id: RouteId | "*",
		cb: Func<[Context], MaybePromise<CResponse | undefined>>,
	): Promise<CResponse | undefined> {
		const mw = $routerStore.get().findMiddleware(id);
		const mwInboundResult = await mw.inbound(ctx);
		if (mwInboundResult instanceof CResponse) {
			log.debug("returned on mwInboundResult");
			return mwInboundResult;
		}

		const cbResult = await cb(ctx);
		if (!cbResult) {
			return cbResult;
		}

		ctx.res = cbResult;
		const mwOutboundResult = await mw.outbound(ctx);
		if (mwOutboundResult instanceof CResponse) {
			log.debug("returned on mwOutboundResult");
			return mwOutboundResult;
		}

		return ctx.res;
	}

	//
	// protected async handleRequest(
	// 	req: CRequest,
	// 	onUpgrade: Func<[WebSocketRoute], undefined>,
	// ): Promise<Response | undefined> {
	// 	let res: CResponse;
	//
	// 	try {
	// 		if (req.isPreflight) {
	// 			res = await this.handlePreflight(req);
	// 		} else {
	// 			const router = $routerStore.get();
	//
	// 			const ctx = Context.makeFromRequest(req);
	// 			// gmw = global middlewares
	// 			const gmw = router.findMiddleware("*");
	// 			await gmw.inbound(ctx);
	//
	// 			const match = router.findRoute(req);
	// 			if (!match) {
	// 				res = await this.handleNotFound(req);
	// 			} else {
	// 				// lmw = local middlewares
	// 				const lmw = router.findMiddleware(match.route.id);
	// 				await lmw.inbound(ctx);
	//
	// 				await Context.appendParsedData(ctx, req, match);
	//
	// 				const result = await match.route.handler(ctx);
	// 				if (result instanceof WebSocketRoute && req.isWebsocket) {
	// 					// ws requests return undefined
	// 					return onUpgrade(result);
	// 				} else if (result instanceof CResponse) {
	// 					res = result;
	// 				} else {
	// 					res = new CResponse(result, ctx.res);
	// 				}
	// 				const mwResult = await lmw.outbound(ctx);
	// 				if (mwResult instanceof CResponse) {
	// 					res = mwResult;
	// 				}
	// 			}
	//
	// 			const gmwResult = await gmw.outbound(ctx);
	// 			if (gmwResult instanceof CResponse) {
	// 				res = gmwResult;
	// 			}
	// 		}
	// 	} catch (err) {
	// 		// handle any thrown error
	// 		res = await this.handleError(err as Error);
	// 	}
	//
	// 	// return regular web response
	// 	return res.response;
	// }
	//
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
