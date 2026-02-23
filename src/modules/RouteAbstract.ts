import { _globalPrefixEnvKey } from "@/constants/_globalPrefixEnvKey";
import { Method } from "@/enums/Method";
import { RouteVariant } from "@/enums/RouteVariant";
import { Config } from "@/modules/Config";
import { Route } from "@/modules/Route";
import type { RouteDefinition } from "@/types/RouteDefinition";
import type { RouteHandler } from "@/types/RouteHandler";
import type { RouteId } from "@/types/RouteId";
import type { RouteModel } from "@/types/RouteModel";
import { joinPathSegments } from "@/utils/joinPathSegments";

export abstract class RouteAbstract<
	Path extends string = string,
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> {
	abstract variant: RouteVariant;
	abstract endpoint: Path;
	abstract method: Method;
	abstract pattern: RegExp;
	abstract id: RouteId;
	abstract handler: RouteHandler<R, B, S, P>;
	abstract model?: RouteModel<R, B, S, P>;

	resolveEndpoint(
		definition: RouteDefinition<Path>,
		variant: RouteVariant,
	): Path {
		const endpoint =
			typeof definition === "string" ? definition : definition.path;
		if (variant === RouteVariant.dynamic) {
			return joinPathSegments(
				Config.get(_globalPrefixEnvKey, { fallback: "" }),
				endpoint,
			);
		}
		return endpoint;
	}

	resolveMethod(definition: RouteDefinition<Path>): Method {
		return typeof definition === "string" ? Method.GET : definition.method;
	}

	resolvePattern(endpoint: Path): RegExp {
		// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
		const regex = endpoint
			.split("/")
			.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
			.join("/");
		return new RegExp(`^${regex}$`);
	}

	resolveId(method: Method, endpoint: Path): RouteId {
		return Route.makeRouteId(method, endpoint);
	}
}
