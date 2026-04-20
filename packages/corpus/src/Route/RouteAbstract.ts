import type { Func } from "corpus-utils/Func";
import { joinPathSegments } from "corpus-utils/joinPathSegments";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import { BaseRouteAbstract } from "@/BaseRoute/BaseRouteAbstract";
import { RouteVariant } from "@/BaseRoute/RouteVariant";
import type { Context } from "@/Context/Context";
import { $registry } from "@/index";
import { Method } from "@/Method/Method";
import type { RouteCallback } from "@/Route/RouteCallback";
import type { RouteDefinition } from "@/Route/RouteDefinition";

export abstract class RouteAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> extends BaseRouteAbstract<B, S, P, R, E> {
	// FROM CONSTRUCTOR
	abstract readonly definition: RouteDefinition<E>;

	abstract callback: RouteCallback<B, S, P, R>;

	// BASE ROUTE PROPERTIES
	readonly variant: RouteVariant = RouteVariant.dynamic;

	get endpoint(): E {
		return joinPathSegments(
			$registry.prefix,
			typeof this.definition === "string" ? this.definition : this.definition.path,
		);
	}

	get method(): Method {
		return typeof this.definition === "string" ? Method.GET : this.definition.method;
	}

	get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>> {
		return this.callback;
	}
}
