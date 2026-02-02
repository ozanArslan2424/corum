import { type __Coreum_DBClientInterface } from "@/lib/DBClient/__Coreum_DBClientInterface";
import { type __Coreum_ServeOptions } from "@/lib/serve/__Coreum_ServeOptions";
import { __Coreum_Request } from "../Request/__Coreum_Request";
import { __Coreum_getRuntime } from "@/lib/runtime/__Coreum_getRuntime";
import { __Coreum_serve } from "@/lib/serve/__Coreum_serve";
import { __Coreum_Controller } from "@/lib/Controller/__Coreum_Controller";
import { __Coreum_Cors } from "@/lib/Cors/__Coreum_Cors";
import { __Coreum_Middleware } from "@/lib/Middleware/__Coreum_Middleware";
import { type __Coreum_OnlyBun_HTMLBundle } from "@/lib/HTMLBundle/__Coreum_OnlyBun_HTMLBundle";
import { __Coreum_Route } from "@/lib/Route/__Coreum_Route";
import { __Coreum_Response } from "@/lib/Response/__Coreum_Response";
import { __Coreum_Status } from "@/lib/Status/__Coreum_Status";
import type { __Coreum_ErrorCallback } from "./__Coreum_ErrorCallback";
import type { __Coreum_FetchCallback } from "./__Coreum_FetchCallback";
import type { __Coreum_ServerOptions } from "./__Coreum_ServerOptions";
import { textIsEqual } from "@/utils/textIsEqual";

export class __Coreum_Server {
	// TODO: Update logger
	private readonly logger = console;
	readonly routes = new Map<string, __Coreum_Route>();

	db?: __Coreum_DBClientInterface;
	controllers: __Coreum_Controller[];
	middlewares?: __Coreum_Middleware[];
	floatingRoutes?: __Coreum_Route[];
	staticPages?: Record<string, __Coreum_OnlyBun_HTMLBundle>;
	cors?: __Coreum_Cors;
	onError?: __Coreum_ErrorCallback;
	onNotFound?: __Coreum_FetchCallback;
	onMethodNotAllowed?: __Coreum_FetchCallback;

	constructor(readonly options: __Coreum_ServerOptions) {
		this.db = options.db;
		this.controllers = options.controllers;
		this.middlewares = options.middlewares;
		this.floatingRoutes = options.floatingRoutes;
		this.staticPages = options.staticPages;
		this.cors = options.cors;
		this.onError = options.onError;
		this.onNotFound = options.onNotFound;
		this.onMethodNotAllowed = options.onMethodNotAllowed;

		if (this.middlewares && this.middlewares.length > 0) {
			for (const middleware of this.middlewares) {
				this.controllers = middleware.use(options.controllers);
			}
		}

		for (const controller of this.controllers) {
			for (const route of controller.routes) {
				this.routes.set(route.id, route);
			}
		}

		if (this.floatingRoutes && this.floatingRoutes.length > 0) {
			for (const floatingRoute of this.floatingRoutes) {
				this.routes.set(floatingRoute.id, floatingRoute);
			}
		}

		console.log(this.routes.keys());
	}

	private async getResponse(req: __Coreum_Request): Promise<__Coreum_Response> {
		try {
			if (req.isPreflight) {
				return new __Coreum_Response("Departed");
			}

			if (req.isMethodNotAllowed) {
				return await this.handleMethodNotAllowed(req);
			}

			const route = this.findMatchingRoute(req);
			if (route) {
				return await route.handler(req);
			}

			return await this.handleNotFound(req);
		} catch (err) {
			return await this.handleError(err as Error);
		}
	}

	public async handleFetch(req: __Coreum_Request): Promise<__Coreum_Response> {
		const res = await this.getResponse(req);

		if (this.cors !== undefined) {
			const headers = this.cors.getCorsHeaders(req, res);
			res.headers.innerCombine(headers);
		}

		return res;
	}

	private handleMethodNotAllowed: __Coreum_FetchCallback = async (req) => {
		if (this.onMethodNotAllowed) {
			return this.onMethodNotAllowed(req);
		}
		return new __Coreum_Response(`${req.method} does not exist.`, {
			status: __Coreum_Status.METHOD_NOT_ALLOWED,
		});
	};

	private handleNotFound: __Coreum_FetchCallback = async (req) => {
		if (this.onNotFound) {
			return this.onNotFound(req);
		}
		return new __Coreum_Response(`${req.method} on ${req.url} does not exist.`, {
			status: __Coreum_Status.NOT_FOUND,
		});
	};

	private handleError: __Coreum_ErrorCallback = async (err) => {
		if (this.onError) {
			return this.onError(err);
		}
		return new __Coreum_Response(err, { status: __Coreum_Status.INTERNAL_SERVER_ERROR });
	};

	private findMatchingRoute(req: __Coreum_Request): __Coreum_Route | undefined {
		const url = new URL(req.url);
		let path = url.pathname;
		return Array.from(this.routes.values()).find(
			(route) => path.match(route.pattern) && textIsEqual(req.method, route.method, "upper"),
		);
	}

	private async exit() {
		this.logger.log("Shutting down gracefully...");
		await this.db?.disconnect();
		process.exit(0);
	}

	public async listen(
		port?: __Coreum_ServeOptions["port"],
		hostname?: __Coreum_ServeOptions["hostname"],
	) {
		try {
			process.on("SIGINT", () => this.exit());
			process.on("SIGTERM", () => this.exit());

			this.logger.log(
				`
Core server starting...
-> Runtime: ${__Coreum_getRuntime()}
-> Hostname: ${hostname}
-> Port: ${port}
`,
			);

			await this.db?.connect();

			__Coreum_serve({
				port: port ?? 3000,
				hostname: hostname,
				staticPages: this.staticPages,
				fetch: async (request) => {
					const req = new __Coreum_Request(request);
					const res = await this.handleFetch(req);
					return res.response;
				},
			});
		} catch (err) {
			this.logger.error("Server unable to start:", err);
			await this.exit();
		}
	}
}
