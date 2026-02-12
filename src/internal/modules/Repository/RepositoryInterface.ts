import type { DatabaseClientInterface } from "@/internal/modules/DatabaseClient/DatabaseClientInterface";

export interface RepositoryInterface {
	readonly db: DatabaseClientInterface;
}
