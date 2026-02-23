import type { Schema } from "@/types/Schema";

export type RouteModel<R = unknown, B = unknown, S = unknown, P = unknown> = {
	response?: Schema<R>;
	body?: Schema<B>;
	search?: Schema<S>;
	params?: Schema<P>;
};
