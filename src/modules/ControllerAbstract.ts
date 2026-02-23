/** Extend this class to create your own controllers. */

import { Method } from "@/enums/Method";
import type { HttpResponse } from "@/modules/HttpResponse";
import { Route } from "@/modules/Route";
import type { RouteAbstract } from "@/modules/RouteAbstract";
import { StaticRoute } from "@/modules/StaticRoute";
import type { ControllerOptions } from "@/types/ControllerOptions";
import type { MiddlewareHandler } from "@/types/MiddlewareHandler";
import type { OrString } from "@/types/OrString";
import type { RouteDefinition } from "@/types/RouteDefinition";
import type { RouteHandler } from "@/types/RouteHandler";
import type { RouteId } from "@/types/RouteId";
import type { RouteModel } from "@/types/RouteModel";
import { joinPathSegments } from "@/utils/joinPathSegments";

export abstract class ControllerAbstract {
	constructor(opts?: ControllerOptions) {
		this.prefix = opts?.prefix;
		this.beforeEach = opts?.beforeEach;
	}

	routeIds: Set<RouteId> = new Set<RouteId>();
	protected prefix?: string;
	protected beforeEach?: MiddlewareHandler;

	protected route<
		Path extends string = string,
		B = unknown,
		R = unknown,
		S = unknown,
		P = unknown,
	>(
		definition: RouteDefinition<Path>,
		handler: RouteHandler<B, R, S, P>,
		schemas?: RouteModel<B, R, S, P>,
	): RouteAbstract<Path, B, R, S, P> {
		const route = new Route(
			{
				method: typeof definition === "string" ? Method.GET : definition.method,
				path: joinPathSegments<Path>(
					this.prefix,
					typeof definition === "string" ? definition : definition.path,
				),
			},
			async (ctx) => {
				await this.beforeEach?.(ctx);
				return handler(ctx);
			},
			schemas,
		);
		this.routeIds.add(route.id);
		return route;
	}

	protected staticRoute<Path extends string = string>(
		path: Path,
		filePath: string,
		extension?: OrString<"html" | "css" | "js" | "ts">,
	): RouteAbstract<Path, HttpResponse<string>> {
		const route = new StaticRoute(
			joinPathSegments<Path>(this.prefix, path),
			filePath,
			extension,
		);
		this.routeIds.add(route.id);
		return route;
	}
}
