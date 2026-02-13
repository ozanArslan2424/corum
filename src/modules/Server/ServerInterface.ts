import type { CorsOptions } from "@/modules/Cors/types/CorsOptions";
import type { RouterInterface } from "@/modules/Router/RouterInterface";
import type { ErrorHandler } from "@/modules/Server/types/ErrorHandler";
import type { RequestHandler } from "@/modules/Server/types/RequestHandler";
import type { ServeOptions } from "@/modules/Server/types/ServeOptions";
import type { MaybePromise } from "@/utils/MaybePromise";

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
	exit(): Promise<void>;
	handle(request: Request): Promise<Response>;
}
