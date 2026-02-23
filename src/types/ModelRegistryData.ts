import type { Validator } from "./Validator";

export type ModelRegistryData<
	R = unknown,
	B = unknown,
	S = unknown,
	P = unknown,
> = {
	response?: Validator<R>;
	body?: Validator<B>;
	search?: Validator<S>;
	params?: Validator<P>;
};
