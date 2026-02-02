import type { __Coreum_SchemaType } from "../parse/__Coreum_SchemaType";

export type __Coreum_RouteSchemas<
	R extends unknown = unknown,
	B extends unknown = unknown,
	S extends unknown = unknown,
	P extends unknown = unknown,
> = {
	response?: __Coreum_SchemaType<R>;
	body?: __Coreum_SchemaType<B>;
	search?: __Coreum_SchemaType<S>;
	params?: __Coreum_SchemaType<P>;
};
