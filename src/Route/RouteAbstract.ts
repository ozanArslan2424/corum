import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteInterface } from "@/Route/RouteInterface";
import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export abstract class RouteAbstract<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> implements RouteInterface<E, B, S, P, R> {
	abstract variant: RouteVariant;
	abstract endpoint: E;
	abstract method: Method;
	abstract id: string;
	abstract handler: Func<[Context<B, S, P, R>], MaybePromise<R>>;
	abstract model?: RouteModel<B, S, P, R>;

	protected resolveId(method: string, endpoint: E): string {
		return RouteAbstract.makeRouteId(method, endpoint);
	}

	static makeRouteId(method: string, endpoint: string): string {
		return `${method.toUpperCase()} ${endpoint}`;
	}
}
