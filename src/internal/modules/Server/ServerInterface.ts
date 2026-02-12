import type { CorsOptions } from "@/internal/modules/Cors/types/CorsOptions";
import type { RouterInterface } from "@/internal/modules/Router/RouterInterface";
import type { ErrorHandler } from "@/internal/modules/Server/types/ErrorHandler";
import type { RequestHandler } from "@/internal/modules/Server/types/RequestHandler";
import type { ServeOptions } from "@/internal/modules/Server/types/ServeOptions";
import type { MaybePromise } from "@/internal/utils/MaybePromise";

export interface ServerInterface {
	readonly router: RouterInterface;
	setGlobalPrefix(value: string): void;
	setCors(cors: CorsOptions): void;
	setOnError(handler: ErrorHandler): void;
	setOnNotFound(handler: RequestHandler): void;
	setOnBeforeListen(handler: () => MaybePromise<void>): void;
	setOnBeforeExit(handler: () => MaybePromise<void>): void;
	serve(options: ServeOptions): void;
	listen(
		port: ServeOptions["port"],
		hostname: ServeOptions["hostname"],
	): Promise<void>;
	close(): Promise<void>;
	handle(request: Request): Promise<Response>;
}
