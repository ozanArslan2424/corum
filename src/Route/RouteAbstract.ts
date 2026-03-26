import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteId } from "@/Route/types/RouteId";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { OrString } from "@/utils/types/OrString";
import type { RouteInterface } from "@/Route/RouteInterface";

export abstract class RouteAbstract<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> implements RouteInterface<E, B, S, P, R> {
	abstract variant: RouteVariant;
	abstract endpoint: E;
	abstract method: OrString<Method>;
	abstract pattern: RegExp;
	abstract id: RouteId;
	abstract handler: RouteHandler<B, S, P, R>;
	abstract model?: RouteModel<B, S, P, R>;

	protected resolvePattern(endpoint: E): RegExp {
		return RouteAbstract.makeRoutePattern(endpoint);
	}

	protected resolveId(method: string, endpoint: E): RouteId {
		return RouteAbstract.makeRouteId(method, endpoint);
	}

	static makeRouteId(method: string, endpoint: string): RouteId {
		return `${method.toUpperCase()} ${endpoint}`;
	}

	static makeRoutePattern(endpoint: string): RegExp {
		// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
		const regex = endpoint
			.split("/")
			.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
			.join("/");
		return new RegExp(`^${regex}$`);
	}
}
