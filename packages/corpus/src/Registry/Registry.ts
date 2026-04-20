import { logFatal } from "corpus-utils/internalLog";

import { EntityStore } from "@/Registry/EntityStore";
import { MiddlewareStore } from "@/Registry/MiddlewareStore";
import type { Router } from "@/Registry/Router";
import type { RouteModel } from "@/BaseRoute/RouteModel";
import type { XCors } from "@/XCors/XCors";

type DocEntry = {
	id: string;
	endpoint: string;
	method: string;
	model: RouteModel<any, any, any, any> | undefined;
};

export class Registry {
	docs = new Map<string, DocEntry>();
	cors: XCors | null = null;
	prefix: string = "";
	middlewares = new MiddlewareStore();
	entities = new EntityStore();

	private _router: Router | null = null;
	private _initialRouter: Router | null = null;
	get router(): Router {
		if (!this._router)
			logFatal("Router instance missing. Create a Server instance before any routes.");
		return this._router;
	}
	set router(value: Router | null) {
		this._router = value;
		this._initialRouter = value;
	}

	reset() {
		this.prefix = "";
		this._router = this._initialRouter;
		this.cors = null;
		this.middlewares = new MiddlewareStore();
		this.entities = new EntityStore();
	}
}
