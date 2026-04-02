import type { Context } from "@/Context/Context";
import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { DynamicRouteCallback } from "@/Route/types/DynamicRouteCallback";
import type { DynamicRouteDefinition } from "@/Route/types/DynamicRouteDefinition";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export abstract class DynamicRouteAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> extends RouteAbstract<B, S, P, R, E> {
	// FROM CONSTRUCTOR
	abstract readonly definition: DynamicRouteDefinition<E>;

	abstract callback: DynamicRouteCallback<B, S, P, R>;

	// BASE ROUTE PROPERTIES
	readonly variant: RouteVariant = RouteVariant.dynamic;

	get endpoint(): E {
		return typeof this.definition === "string"
			? this.definition
			: this.definition.path;
	}

	get method(): Method {
		return typeof this.definition === "string"
			? Method.GET
			: this.definition.method;
	}

	get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>> {
		return this.callback;
	}
}
