import type { Method } from "@/CRequest/enums/Method";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteVariant } from "@/Route/enums/RouteVariant";
import type { RouteId } from "@/Route/types/RouteId";
import type { OrString } from "@/utils/types/OrString";

export interface RouteInterface<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
	R = unknown,
> {
	variant: RouteVariant;
	id: RouteId;
	method: OrString<Method>;
	endpoint: E;
	pattern: RegExp;
	handler: RouteHandler<B, S, P, R>;
	model?: RouteModel<B, S, P, R>;
}
