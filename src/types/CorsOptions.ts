import type { HttpHeaderKey } from "./HttpHeaderKey";

export type CorsOptions = {
	allowedOrigins?: string[];
	allowedMethods?: string[];
	allowedHeaders?: HttpHeaderKey[];
	credentials?: boolean;
};
