import type { __Coreum_ServeOptions } from "./__Coreum_ServeOptions";

export function __Coreum_serveBun(options: __Coreum_ServeOptions) {
	Bun.serve({
		port: options.port,
		hostname: options.hostname,
		fetch: options.fetch,
		routes: options.staticPages,
	});
}
