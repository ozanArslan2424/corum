import { MiddlewareRegistry } from "@/Registry/MiddlewareRegistry";
import type { Router } from "@/Registry/Router";
import type { XCors } from "@/XCors/XCors";
import type { RouteConfig } from "@/Route/RouteConfig";
import { logFatal } from "corpus-utils/internalLog";

type DocEntry = {
	id: string;
	endpoint: string;
	method: string;
	model: RouteConfig<any, any, any, any> | undefined;
};

export class Registry {
	private _docs: Record<string, DocEntry> = {};
	public get docs(): Record<string, DocEntry> {
		return this._docs;
	}
	public set docs(value: Record<string, DocEntry>) {
		this._docs = value;
	}
	public appendDocs(id: string, value: DocEntry) {
		this.docs = { ...this.docs, [id]: value };
	}

	// PREFIX
	private _prefix: string = "";
	public get prefix(): string {
		return this._prefix;
	}
	public set prefix(value: string) {
		this._prefix = value;
		this.prefixRemake = () => {
			this.prefix = value;
		};
	}
	prefixRemake = () => {
		this.prefix = "";
	};

	// ROUTER
	private _router: Router | null = null;
	public get router(): Router {
		if (!this._router) {
			logFatal(
				"Router instance missing. Create a Server instance before any routes.",
			);
		}
		return this._router;
	}
	public set router(value: Router | null) {
		this._router = value;
		this.routerRemake = () => {
			this.router = value;
		};
	}
	routerRemake = () => {
		this.router = null;
	};

	// CORS
	private _cors: XCors | null = null;
	public get cors(): XCors | null {
		return this._cors;
	}
	public set cors(value: XCors | null) {
		this._cors = value;
	}

	// MIDDLEWARES
	private _middlewares: MiddlewareRegistry = new MiddlewareRegistry();
	public get middlewares(): MiddlewareRegistry {
		return this._middlewares;
	}
	public set middlewares(value: MiddlewareRegistry) {
		this._middlewares = value;
	}

	// RESET
	public reset() {
		this.prefixRemake();
		this.routerRemake();
		this.cors = null;
		this.middlewares = new MiddlewareRegistry();
	}
}
