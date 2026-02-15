import { EnvInterface as IEnv } from "@/modules/Config/EnvInterface";
import { DatabaseClientInterface as IDatabaseClient } from "@/modules/Repository/DatabaseClientInterface";

declare module "coreum" {
	export interface Env extends IEnv {}
	export interface DatabaseClientInterface extends IDatabaseClient {}
}

export as namespace coreum;
