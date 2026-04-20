import type { Method } from "@/Method/Method";
import type { BaseRouteHandler } from "@/BaseRoute/BaseRouteHandler";
import type { RouteModel } from "@/BaseRoute/RouteModel";
import type { RouteVariant } from "@/BaseRoute/RouteVariant";

export interface BaseRouteInterface<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> {
	get id(): string;
	get handler(): BaseRouteHandler<B, S, P, R>;
	get endpoint(): E;
	get method(): Method;
	readonly variant: RouteVariant;
	readonly model?: RouteModel<B, S, P, R>;
	register(): void;
}
