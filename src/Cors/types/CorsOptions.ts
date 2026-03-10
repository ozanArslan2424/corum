import type { HeaderKey } from "@/CHeaders/types/HeaderKey";

export type CorsOptions = {
	allowedOrigins?: string[];
	allowedMethods?: string[];
	allowedHeaders?: HeaderKey[];
	credentials?: boolean;
};
