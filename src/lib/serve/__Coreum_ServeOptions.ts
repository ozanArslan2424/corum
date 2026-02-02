import type { __Coreum_OnlyBun_HTMLBundle } from "../HTMLBundle/__Coreum_OnlyBun_HTMLBundle";

export interface __Coreum_ServeOptions {
	port: number;
	hostname?: "0.0.0.0" | "127.0.0.1" | "localhost" | (string & {}) | undefined;
	fetch: (request: Request) => Promise<Response>;
	staticPages?: Record<string, __Coreum_OnlyBun_HTMLBundle>;
}
