import type { SchemaValidator } from "@/Model/types/SchemaValidator";
import type { AnyRoute } from "@/Route/types/AnyRoute";

export type RouterRouteData<B = unknown, S = unknown, P = unknown> = Pick<
	AnyRoute,
	"id" | "endpoint" | "method" | "pattern" | "handler" | "variant"
> & {
	model?: {
		body?: SchemaValidator<B>;
		search?: SchemaValidator<S>;
		params?: SchemaValidator<P>;
	};
};
