import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { Route } from "@/Route/Route";
import type { RouteDefinition } from "@/Route/types/RouteDefinition";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouteModel } from "@/Model/types/RouteModel";
import { joinPathSegments } from "@/utils/joinPathSegments";
import type { OrString } from "@/utils/types/OrString";
import { _prefixStore } from "@/index";

export abstract class RouteAbstract<
	Path extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> {
	abstract variant: RouteVariant;
	abstract endpoint: Path;
	abstract method: OrString<Method>;
	abstract pattern: RegExp;
	abstract id: RouteId;
	abstract handler: RouteHandler<B, S, P, R>;
	abstract model?: RouteModel<B, S, P, R>;

	protected resolveEndpoint(
		definition: RouteDefinition<Path>,
		variant: RouteVariant,
	): Path {
		const endpoint =
			typeof definition === "string" ? definition : definition.path;
		if (variant === RouteVariant.dynamic) {
			return joinPathSegments(_prefixStore.get(), endpoint);
		}
		return endpoint;
	}

	protected resolveMethod(definition: RouteDefinition<Path>): Method {
		return typeof definition === "string" ? Method.GET : definition.method;
	}

	protected resolvePattern(endpoint: Path): RegExp {
		return Route.makeRoutePattern(endpoint);
	}

	protected resolveId(method: string, endpoint: Path): RouteId {
		return Route.makeRouteId(method, endpoint);
	}
}
