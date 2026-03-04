import type { SchemaValidator } from "@/Model/types/SchemaValidator";

export type RouterModelData<B = unknown, S = unknown, P = unknown> = {
	body?: SchemaValidator<B>;
	search?: SchemaValidator<S>;
	params?: SchemaValidator<P>;
};
