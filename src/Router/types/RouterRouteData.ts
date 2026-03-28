import type { Context } from "@/Context/Context";
import type { SchemaValidator } from "@/Model/types/SchemaValidator";
import type { Method } from "@/CRequest/enums/Method";
import type { RouteVariant } from "@/Route/enums/RouteVariant";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type RouterRouteData<B = unknown, S = unknown, P = unknown> = {
	variant: RouteVariant;
	id: string;
	method: Method;
	endpoint: string;
	handler: Func<[Context<B, S, P, any>], MaybePromise<any>>;
	model?: {
		body?: SchemaValidator<B>;
		search?: SchemaValidator<S>;
		params?: SchemaValidator<P>;
	};
};
