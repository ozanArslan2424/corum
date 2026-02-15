import type { DatabaseClientInterface } from "@/modules/Repository/DatabaseClientInterface";
import type { RepositoryInterface } from "@/modules/Repository/RepositoryInterface";

export abstract class RepositoryAbstract implements RepositoryInterface {
	constructor(readonly db: DatabaseClientInterface) {}
}
