import type { ControllerInterface } from "@/internal/modules/Controller/ControllerInterface";
import type { RouteInterface } from "@/internal/modules/Route/RouteInterface";
import { Route } from "@/internal/modules/Route/Route";
import type { ControllerOptions } from "@/internal/modules/Controller/types/ControllerOptions";
import type { RouteHandler } from "@/internal/modules/Route/types/RouteHandler";
import type { RouteDefinition } from "@/internal/modules/Route/types/RouteDefinition";
import type { RouteSchemas } from "@/internal/modules/Parser/types/RouteSchemas";
import { joinPathSegments } from "@/internal/utils/joinPathSegments";
import { textIsDefined } from "@/internal/utils/textIsDefined";
import { createHash } from "@/internal/utils/createHash";
import { Method } from "@/internal/enums/Method";
import { getServerInstance } from "@/internal/modules/Server/ServerInstance";

// TODO: opts.beforeEach

/** Extend this class to create your own controllers. */

export abstract class ControllerAbstract<
	Prefix extends string = string,
> implements ControllerInterface {
	constructor(private readonly opts?: ControllerOptions<Prefix>) {}

	get id(): string {
		const input = [this.constructor.name];
		if (this.prefix) input.push(this.prefix);
		return createHash(...input);
	}

	get prefix(): string | undefined {
		const globalPrefix = getServerInstance().router.globalPrefix;
		if (textIsDefined(globalPrefix)) {
			return joinPathSegments(globalPrefix, this.opts?.prefix);
		}
		return this.opts?.prefix;
	}

	route<
		Path extends string = string,
		B = unknown,
		R = unknown,
		S = unknown,
		P = unknown,
	>(
		definition: RouteDefinition<Path>,
		handler: RouteHandler<B, R, S, P>,
		schemas?: RouteSchemas<B, R, S, P>,
	): RouteInterface<Path, B, R, S, P> {
		return new Route(
			this.resolveRouteDefinition(definition),
			async (ctx) => {
				await this.opts?.beforeEach?.(ctx);
				return handler(ctx);
			},
			schemas,
			this.id,
		);
	}

	protected resolveRouteDefinition<Path extends string = string>(
		definition: RouteDefinition<Path>,
	): RouteDefinition<Path> {
		const path = typeof definition === "string" ? definition : definition.path;
		const method =
			typeof definition === "string" ? Method.GET : definition.method;

		if (textIsDefined(this.prefix)) {
			return { method, path: joinPathSegments(this.prefix, path) };
		}

		return { method, path };
	}
}
