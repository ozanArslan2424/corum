import { __Coreum_Context } from "@/lib/Context/__Coreum_Context";
import type { __Coreum_Controller } from "@/lib/Controller/__Coreum_Controller";
import type { __Coreum_MiddlewareCallback } from "./__Coreum_MiddlewareCallback";
import type { __Coreum_MiddlewareProvider } from "./__Coreum_MiddlewareProvider";
import { isObjectWith } from "@/utils/isObjectWith";

export class __Coreum_Middleware<D = void> {
	private callback: __Coreum_MiddlewareCallback<D>;

	constructor(argument: __Coreum_MiddlewareCallback<D> | __Coreum_MiddlewareProvider<D>) {
		this.callback = isObjectWith<__Coreum_MiddlewareProvider<D>>(argument, "middleware")
			? argument.middleware
			: argument;
	}

	use(controllers: __Coreum_Controller[]): __Coreum_Controller[] {
		for (const controller of controllers) {
			for (const route of controller.routes) {
				const originalHandler = route.handler;
				route.handler = async (req, ctx) => {
					const context = ctx ?? new __Coreum_Context(req, route.path);
					const data = await this.callback(context);
					context.data = data ?? undefined;
					return originalHandler(req, context);
				};
			}
		}
		return controllers;
	}
}
