import type { DatabaseClientInterface } from "@/internal/modules/DatabaseClient/DatabaseClientInterface";
import type { RepositoryInterface } from "@/internal/modules/Repository/RepositoryInterface";

export abstract class RepositoryAbstract implements RepositoryInterface {
	constructor(readonly db: DatabaseClientInterface) {}
}
