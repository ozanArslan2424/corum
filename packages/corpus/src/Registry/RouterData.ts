import type { Method } from "@/CRequest/Method";
import type { RouteVariant } from "@/Route/RouteVariant";
import type { RouteHandler } from "@/Route/RouteHandler";
import type { SchemaValidator } from "corpus-utils/Schema";

export type RouterData = {
	variant: RouteVariant;
	id: string;
	method: Method;
	endpoint: string;
	handler: RouteHandler<any, any, any, any>;
	model?: {
		body?: SchemaValidator<any>;
		search?: SchemaValidator<any>;
		params?: SchemaValidator<any>;
	};
};
