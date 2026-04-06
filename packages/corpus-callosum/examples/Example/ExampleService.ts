import { C } from "@ozanarslan/corpus";
import type { ExampleType } from "./ExampleModel";
import type { ExampleRepository } from "./ExampleRepository";

export class ExampleService {
	constructor(private readonly repo: ExampleRepository) {}

	async get(
		params: ExampleType["get"]["params"],
	): Promise<ExampleType["get"]["response"]> {
		const entity = this.repo.findById(params.id);
		if (!entity) {
			throw new C.Error("not found", C.Status.NOT_FOUND);
		}
		return entity;
	}

	async list(
		search: ExampleType["list"]["search"],
	): Promise<ExampleType["list"]["response"]> {
		return this.repo.findMany({ page: search.page, limit: search.limit });
	}

	async create(
		body: ExampleType["create"]["body"],
	): Promise<ExampleType["create"]["response"]> {
		return this.repo.create({ name: body.name });
	}

	async update(
		params: ExampleType["update"]["params"],
		body: ExampleType["update"]["body"],
	): Promise<ExampleType["update"]["response"]> {
		const entity = this.repo.update(params.id, { name: body.name });
		if (!entity) {
			throw new C.Error("not found", C.Status.NOT_FOUND);
		}
		return entity;
	}

	async delete(
		params: ExampleType["delete"]["params"],
	): Promise<ExampleType["delete"]["response"]> {
		const deleted = this.repo.delete(params.id);
		if (!deleted) {
			throw new C.Error("internal error", C.Status.INTERNAL_SERVER_ERROR);
		}
	}
}
