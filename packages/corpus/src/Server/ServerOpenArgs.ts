export type ServerOpenArgs = {
	port: number;
	hostname?: "0.0.0.0" | "127.0.0.1" | "localhost" | (string & {}) | undefined;
};
