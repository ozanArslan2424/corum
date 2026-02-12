import { Method } from "@/internal/enums/Method";
import type { RouteInterface } from "@/internal/modules/Route/RouteInterface";
import type { RouteId } from "@/internal/modules/Route/types/RouteId";
import type { RouteHandler } from "@/internal/modules/Route/types/RouteHandler";
import type { RouteSchemas } from "@/internal/modules/Parser/types/RouteSchemas";
import { joinPathSegments } from "@/internal/utils/joinPathSegments";
import { textIsDefined } from "@/internal/utils/textIsDefined";
import type { RouteDefinition } from "@/internal/modules/Route/types/RouteDefinition";
import { getServerInstance } from "@/internal/modules/Server/ServerInstance";

export abstract class RouteAbstract<
	Path extends string = string,
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> implements RouteInterface<Path, R, B, S, P> {
	constructor(
		private readonly definition: RouteDefinition<Path>,
		handler: RouteHandler<R, B, S, P>,
		readonly schemas?: RouteSchemas<R, B, S, P>,
		readonly controllerId?: string,
	) {
		this.handler = handler;
		getServerInstance().router.addRoute(this);
	}

	handler: RouteHandler<R, B, S, P>;

	get path(): Path {
		const endpoint =
			typeof this.definition === "string"
				? this.definition
				: this.definition.path;
		const globalPrefix = getServerInstance().router.globalPrefix;
		if (textIsDefined(globalPrefix) && !endpoint.startsWith(globalPrefix)) {
			return joinPathSegments(globalPrefix, endpoint);
		}
		return endpoint;
	}

	get method(): Method {
		return typeof this.definition === "string"
			? Method.GET
			: this.definition.method;
	}

	get pattern(): RegExp {
		// Convert route pattern to regex: "/users/:id" -> /^\/users\/([^\/]+)$/
		const regex = this.path
			.split("/")
			.map((part) => (part.startsWith(":") ? "([^\\/]+)" : part))
			.join("/");
		const pattern = new RegExp(`^${regex}$`);
		return pattern;
	}

	get id(): RouteId {
		return `[${this.method}]:[${this.path}]`;
	}
}
