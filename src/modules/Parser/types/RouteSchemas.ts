import type { Schema } from "@/modules/Parser/types/Schema";

export type RouteSchemas<R = unknown, B = unknown, S = unknown, P = unknown> = {
	response?: Schema<R>;
	body?: Schema<B>;
	search?: Schema<S>;
	params?: Schema<P>;
};
