import { EnvInterface as IEnv } from "@/internal/modules/Config/EnvInterface";
import { DatabaseClientInterface as IDatabaseClient } from "@/internal/modules/DatabaseClient/DatabaseClientInterface";
import { LoggerInterface as ILogger } from "@/internal/modules/Logger/LoggerInterface";

declare module "coreum" {
	export interface Env extends IEnv {}
	export interface DatabaseClientInterface extends IDatabaseClient {}
	export interface LoggerInterface extends ILogger {}
}

export as namespace coreum;
