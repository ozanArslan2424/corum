import type { __Coreum_MiddlewareCallback } from "./__Coreum_MiddlewareCallback";

export type __Coreum_MiddlewareProvider<D = void> = {
	middleware: __Coreum_MiddlewareCallback<D>;
};
