import type { Type } from "arktype";

export type RouteSchemas<R = unknown, B = unknown, S = unknown, P = unknown> = {
	response?: Type<R>;
	body?: Type<B>;
	search?: Type<S>;
	params?: Type<P>;
};
