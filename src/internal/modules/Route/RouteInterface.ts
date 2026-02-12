import type { Method } from "@/internal/enums/Method";
import type { RouteHandler } from "@/internal/modules/Route/types/RouteHandler";
import type { RouteId } from "@/internal/modules/Route/types/RouteId";
import type { RouteSchemas } from "@/internal/modules/Parser/types/RouteSchemas";

export interface RouteInterface<
	Path extends string = string,
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> {
	handler: RouteHandler<R, B, S, P>;
	readonly model?: RouteSchemas<R, B, S, P>;
	controllerId?: string;
	get path(): Path;
	get method(): Method;
	get pattern(): RegExp;
	get id(): RouteId;
}
