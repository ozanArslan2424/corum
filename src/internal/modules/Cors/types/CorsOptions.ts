import type { HttpHeaderKey } from "@/internal/modules/HttpHeaders/types/HttpHeaderKey";

export type CorsOptions = {
	allowedOrigins?: string[];
	allowedMethods?: string[];
	allowedHeaders?: HttpHeaderKey[];
	credentials?: boolean;
};
