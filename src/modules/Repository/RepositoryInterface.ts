import type { DatabaseClientInterface } from "@/modules/Repository/DatabaseClientInterface";

export interface RepositoryInterface {
	readonly db: DatabaseClientInterface;
}
