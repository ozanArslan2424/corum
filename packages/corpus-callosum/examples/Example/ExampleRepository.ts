import { X } from "@ozanarslan/corpus";
import type { ExampleType } from "./ExampleModel";

export class ExampleRepository extends X.Repository {
	findById(id: ExampleType["entity"]["id"]): ExampleType["entity"] | null {
		return this.db.examples.get(id) ?? null;
	}

	findMany(filters: {
		page?: number;
		limit?: number;
	}): Array<ExampleType["entity"]> {
		const all = Array.from(this.db.examples.values());
		const page = filters.page ?? 1;
		const limit = filters.limit ?? 20;
		const start = (page - 1) * limit;
		return all.slice(start, start + limit);
	}

	create(data: Omit<ExampleType["entity"], "id">): ExampleType["entity"] {
		const id = this.db.examples.size.toString();
		this.db.examples.set(id, {
			id,
			name: data.name,
		});
		return { id, name: data.name };
	}

	update(
		id: ExampleType["entity"]["id"],
		data: Partial<ExampleType["entity"]>,
	): ExampleType["entity"] | null {
		const exists = this.db.examples.get(id);
		if (!exists) return null;
		const newEntity = { ...exists, ...data };
		this.db.examples.set(id, newEntity);
		return newEntity;
	}

	delete(id: ExampleType["entity"]["id"]): boolean {
		return this.db.examples.delete(id);
	}
}
