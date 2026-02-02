import type { __Coreum_HeaderKey } from "../Headers/__Coreum_HeaderKey";

export type __Coreum_CorsConfig = {
	allowedOrigins?: string[];
	allowedMethods?: string[];
	allowedHeaders?: __Coreum_HeaderKey[];
	credentials?: boolean;
};
