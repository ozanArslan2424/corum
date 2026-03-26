import type { RouteInterface } from "@/index";
import type { SchemaValidator } from "@/Model/types/SchemaValidator";

export type RouterRouteData<B = unknown, S = unknown, P = unknown> = Pick<
	RouteInterface<string, B, S, P>,
	"id" | "endpoint" | "method" | "pattern" | "handler" | "variant"
> & {
	model?: {
		body?: SchemaValidator<B>;
		search?: SchemaValidator<S>;
		params?: SchemaValidator<P>;
	};
};
