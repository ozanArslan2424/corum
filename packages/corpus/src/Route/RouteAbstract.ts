import { $registry } from "@/index";
import { Method } from "@/CRequest/Method";
import { RouteVariant } from "@/Route/RouteVariant";
import type { RouteConfig } from "@/Route/RouteConfig";
import type { RouteInterface } from "@/Route/RouteInterface";
import type { RouteHandler } from "@/Route/RouteHandler";

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

	abstract get handler(): RouteHandler<B, S, P, R>;

	abstract get endpoint(): E;

	abstract get method(): Method;

	abstract readonly variant: RouteVariant;

	abstract readonly model?: RouteConfig<B, S, P, R>;

	register(): void {
		$registry.router.add(this);
	}
}
