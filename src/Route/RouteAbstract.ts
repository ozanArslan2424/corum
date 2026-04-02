import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteInterface } from "@/Route/RouteInterface";
import type { Context } from "@/Context/Context";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import { $prefixStore, $routerStore } from "@/index";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import { joinPathSegments } from "@/utils/joinPathSegments";

export abstract class RouteAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
	E extends string = string,
> implements RouteInterface<B, S, P, R, E> {
	get id(): string {
		return `${this.method.toUpperCase()} ${this.endpoint}`;
	}

	abstract get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>>;

	abstract get endpoint(): E;

	abstract get method(): Method;

	abstract readonly variant: RouteVariant;

	abstract readonly model?: RouteModel<B, S, P, R>;

	register(): void {
		$routerStore.get().addRoute(this);
	}

	toRouterData(): RouterRouteData {
		const data: RouterRouteData<any, any, any> = {
			id: this.id,
			endpoint:
				this.variant !== RouteVariant.static
					? joinPathSegments($prefixStore.get(), this.endpoint)
					: this.endpoint,
			method: this.method,
			handler: this.handler,
			variant: this.variant,
		};
		return data;
	}
}
