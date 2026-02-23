import { type Method } from "@/enums/Method";
import { RouteVariant } from "@/enums/RouteVariant";
import { getRouterInstance } from "@/index";
import { RouteAbstract } from "@/modules/RouteAbstract";
import type { RouteDefinition } from "@/types/RouteDefinition";
import type { RouteHandler } from "@/types/RouteHandler";
import type { RouteId } from "@/types/RouteId";
import type { RouteModel } from "@/types/RouteModel";

/**
 * The object to define an endpoint. Can be instantiated with "new" or inside a controller
 * with {@link ControllerAbstract.route}. The callback recieves the {@link Context} and can
 * return {@link HttpResponse} or any data. Route instantiation automatically registers
 * to the router.
 * */

export class Route<
	Path extends string = string,
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<Path, R, B, S, P> {
	constructor(
		definition: RouteDefinition<Path>,
		handler: RouteHandler<R, B, S, P>,
		model?: RouteModel<R, B, S, P>,
	) {
		super();
		this.variant = RouteVariant.dynamic;
		this.endpoint = this.resolveEndpoint(definition, this.variant);
		this.method = this.resolveMethod(definition);
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.handler = handler;
		this.model = model;

		getRouterInstance().addRoute(this);
		if (model) {
			getRouterInstance().addModel(this.id, model);
		}
	}

	variant: RouteVariant;
	endpoint: Path;
	method: Method;
	pattern: RegExp;
	id: RouteId;
	handler: RouteHandler<R, B, S, P>;
	model?: RouteModel<R, B, S, P> | undefined;

	static makeRouteId(method: string, endpoint: string): RouteId {
		return `[${method.toUpperCase()}]:[${endpoint}]`;
	}
}
