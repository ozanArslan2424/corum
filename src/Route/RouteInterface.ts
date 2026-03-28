import type { Method } from "@/CRequest/enums/Method";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteVariant } from "@/Route/enums/RouteVariant";
import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export interface RouteInterface<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> {
	variant: RouteVariant;
	id: string;
	method: Method;
	endpoint: E;
	handler: Func<[Context<B, S, P, R>], MaybePromise<R>>;
	model?: RouteModel<B, S, P, R>;
}
