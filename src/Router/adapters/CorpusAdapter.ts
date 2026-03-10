import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import { CError } from "@/CError/CError";
import { isRegexMatch } from "@/utils/isRegexMatch";
import { strIsEqual } from "@/utils/strIsEqual";
import type { RouteId } from "@/Route/types/RouteId";
import { Middleware, Route } from "@/index";
import { ModelRegistry } from "@/Router/registries/ModelRegistry";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { AnyRouteModel } from "@/Model/types/AnyRouteModel";
import { MiddlewareRegistry } from "@/Router/registries/MiddlewareRegistry";
import type { CRequest } from "@/CRequest/CRequest";
import type { AnyRoute } from "@/Route/types/AnyRoute";

export class CorpusAdapter implements RouterAdapterInterface {
	// RouteId -> RouteRegistryData
	private routes = new Map<RouteId, RouterRouteData>();
	private modelRegistry = new ModelRegistry();
	private middlewareRegistry = new MiddlewareRegistry();

	addRoute(data: RouterRouteData): void {
		this.checkPossibleCollision(data);
		this.routes.set(data.id, data);
	}

	addModel(route: AnyRoute, model: AnyRouteModel): void {
		this.modelRegistry.add(route.method, route.endpoint, model);
	}

	addMiddleware(middleware: Middleware): void {
		this.middlewareRegistry.add(middleware);
	}

	find(req: CRequest): RouterReturnData | null {
		const method = req.method;
		const pathname = req.urlObject.pathname;
		const searchParams = req.urlObject.searchParams;

		let route: RouterRouteData | null = null;

		for (const data of this.routes.values()) {
			// Check for pattern match for parameterized routes
			if (
				this.hasAnyParam(data.endpoint) &&
				isRegexMatch(pathname, data.pattern)
			) {
				route = data;
				break;
			}

			// If pattern doesn't match check for missing last part param
			if (
				this.hasLastPartParam(data.endpoint) &&
				strIsEqual(this.removeLastParam(data.endpoint), pathname, "lower")
			) {
				route = data;
				break;
			}

			// Check for simple pathname match for static routes
			if (strIsEqual(data.endpoint, pathname)) {
				// Found exact match
				route = data;
				break;
			}
		}

		if (route === null) {
			throw CError.notFound();
		}

		// The endpoint exists but the method is not allowed
		if (!strIsEqual(method, route.method, "upper")) {
			throw CError.methodNotAllowed();
		}

		return {
			route,
			model: this.modelRegistry.find(route.id),
			middleware: this.middlewareRegistry.find(route.id),
			params: this.extractParams(pathname, route.endpoint),
			search: Object.fromEntries(searchParams),
		};
	}

	list(): Array<RouterRouteData> {
		return Array.from(this.routes.values());
	}

	checkPossibleCollision(n: RouterRouteData): boolean {
		// Collision 1 — exact duplicate route id (same method + same endpoint)
		const dupeMsg = (nId: string) =>
			console.error(
				`Duplicate route detected. ${nId} has already been registered.`,
			);

		// Collision 2 — two param routes match the same URL space
		const dynamicPatternMsg = (nId: string, oId: string) =>
			console.error(
				`Ambiguous dynamic routes. ${nId} and ${oId} match the same URL patterns.`,
			);

		// Collision 3 — new param route's base matches an existing route
		const baseDupeMsg = (nId: string, oId: string) =>
			console.error(
				`Dynamic route overlaps existing route. ${nId} — dropping the last param segment matches ${oId}.`,
			);

		// Collision 4 — new route falls within an existing param route's URL space
		const shadowMsg = (nId: string, oId: string) =>
			console.error(
				`Route shadowed by existing dynamic route. ${nId} will be unreachable — ${oId} captures the same URL space.`,
			);

		const existing = this.routes.get(n.id);
		if (existing) {
			dupeMsg(n.id);
			return true;
		}

		const nHasAnyParam = this.hasAnyParam(n.endpoint);
		const nHasLastPartParam = this.hasLastPartParam(n.endpoint);

		for (const o of this.routes.values()) {
			if (o.method !== n.method) continue;

			if (nHasAnyParam) {
				if (
					isRegexMatch(n.endpoint, o.pattern) ||
					isRegexMatch(o.endpoint, n.pattern)
				) {
					dynamicPatternMsg(n.id, o.id);
					return true;
				}
			}

			if (nHasLastPartParam) {
				if (isRegexMatch(this.removeLastParam(n.endpoint), o.pattern)) {
					baseDupeMsg(n.id, o.id);
					return true;
				}
			}

			const oHasLastPartParam = this.hasLastPartParam(o.endpoint);
			if (oHasLastPartParam) {
				if (
					isRegexMatch(
						n.endpoint,
						Route.makeRoutePattern(this.removeLastParam(o.endpoint)),
					)
				) {
					shadowMsg(n.id, o.id);
					return true;
				}
			}
		}

		return false;
	}

	extractParams(pathname: string, endpoint: string): Record<string, string> {
		const data: Record<string, string> = {};
		if (!this.hasAnyParam(endpoint)) return data;

		const defParts = endpoint.split("/");
		const reqParts = pathname.split("/");

		for (const [i, defPart] of defParts.entries()) {
			const reqPart = reqParts[i];
			if (defPart.startsWith(":") && reqPart !== undefined) {
				data[defPart.slice(1)] = decodeURIComponent(reqPart);
			}
		}

		return data;
	}

	private hasLastPartParam(endpoint: string): boolean {
		if (!this.hasAnyParam(endpoint)) return false;
		const parts = endpoint.split("/");
		return parts[parts.length - 1]?.startsWith(":") ?? false;
	}

	private removeLastParam(endpoint: string): string {
		return endpoint.split("/").slice(0, -1).join("/");
	}

	private hasAnyParam(endpoint: string): boolean {
		if (endpoint.includes("/:")) return true;
		// fallback for super unlikely stuff
		if (!endpoint.includes(":")) return false;
		return endpoint.split("/").some((p) => p.startsWith(":"));
	}
}
