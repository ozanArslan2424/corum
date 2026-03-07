import type { RouterAdapterInterface } from "@/Router/RouterAdapterInterface";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import { HttpError } from "@/Error/HttpError";
import { isRegexMatch } from "@/utils/isRegexMatch";
import { strIsEqual } from "@/utils/strIsEqual";
import type { RouteId } from "@/Route/types/RouteId";
import { Route } from "@/index";

export class CorpusAdapter implements RouterAdapterInterface {
	// RouteId -> RouteRegistryData
	private routes = new Map<RouteId, RouterRouteData>();

	add(data: RouterRouteData): void {
		this.checkPossibleCollision(data);
		this.routes.set(data.id, data);
	}

	find(
		method: string,
		path: string,
	): { route: RouterRouteData; params?: Record<string, unknown> } | null {
		let route: RouterRouteData | null = null;

		for (const data of this.routes.values()) {
			const endpoint = data.endpoint;

			// Check for pattern match for parameterized routes
			if (this.hasAnyParam(endpoint) && isRegexMatch(path, data.pattern)) {
				route = data;
				break;
			}

			// If pattern doesn't match check for missing last part param
			if (
				this.hasLastPartParam(endpoint) &&
				strIsEqual(this.removeLastParam(endpoint), path, "lower")
			) {
				route = data;
				break;
			}

			// Check for simple pathname match for static routes
			if (strIsEqual(endpoint, path)) {
				// Found exact match
				route = data;
				break;
			}
		}

		if (route === null) {
			throw HttpError.notFound();
		}

		// The endpoint exists but the method is not allowed
		if (!strIsEqual(method, route.method, "upper")) {
			throw HttpError.methodNotAllowed();
		}

		return { route };
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
