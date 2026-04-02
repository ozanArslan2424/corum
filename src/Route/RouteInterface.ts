import type { Method } from "@/CRequest/enums/Method";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteVariant } from "@/Route/enums/RouteVariant";
import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";

export interface RouteInterface<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> {
	get id(): string;
	get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>>;
	get endpoint(): E;
	get method(): Method;
	readonly variant: RouteVariant;
	readonly model?: RouteModel<B, S, P, R>;
	register(): void;
	toRouterData(): RouterRouteData;
}
