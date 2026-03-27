import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";

export type ServerOptions = {
	adapter?: RouterAdapterInterface;
	idleTimeout?: number;
	tls?: {
		cert: string | Buffer;
		key: string | Buffer;
		ca?: string | Buffer;
	};
};
