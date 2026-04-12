import type { Method } from "@/CRequest/Method";
import type { RouteConfig } from "@/Route/RouteConfig";
import type { RouteVariant } from "@/Route/RouteVariant";
import type { RouteHandler } from "@/Route/RouteHandler";

export interface RouteInterface<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> {
	get id(): string;
	get handler(): RouteHandler<B, S, P, R>;
	get endpoint(): E;
	get method(): Method;
	readonly variant: RouteVariant;
	readonly model?: RouteConfig<B, S, P, R>;
	register(): void;
}
