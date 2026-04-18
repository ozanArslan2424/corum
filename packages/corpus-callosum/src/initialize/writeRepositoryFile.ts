import type { Config } from "../Config/Config";
import type { ImportableInterface } from "../Importable/ImportableInterface";
import type { ModuleInterface } from "../Module/ModuleInterface";
import { Writer } from "../Writer/Writer";

export function writeRepositoryFile(c: Config, m: ModuleInterface, db: ImportableInterface) {
	const w = new Writer(m.repository.filePath);
	w.$import({ keys: ["X"], from: c.pkgPath });
	w.$import({
		isType: true,
		keys: [m.modelTypeName],
		from: m.model.import(m.repository.filePath),
	});

	w.$class({
		isExported: true,
		name: m.repository.name,
		constr: {
			args: [{ keyword: "private readonly", key: "db", type: db.name }],
		},
		body: (w) => {
			w.$method({
				name: "findById",
				args: [`id: ${m.modelTypeName}["entity"]["id"]`],
				type: `${m.modelTypeName}["entity"] | null`,
				body: (w) => {
					w.$return(`this.db.examples.get(id) ?? null`);
				},
			});

			w.$method({
				name: "findMany",
				args: [`filters: { page?: number; limit?: number; }`],
				type: `Array<${m.modelTypeName}["entity"]>`,
				body: (w) => {
					w.$const({
						name: "all",
						value: "Array.from(this.db.examples.values())",
					});
					w.$const({ name: "page", value: "filters.page ?? 1" });
					w.$const({ name: "limit", value: "filters.limit ?? 20" });
					w.$const({ name: "start", value: "(page - 1) * limit" });
					w.$return("all.slice(start, start + limit)");
				},
			});

			w.$method({
				name: "create",
				args: [`data: Omit<${m.modelTypeName}["entity"], "id">`],
				type: `${m.modelTypeName}["entity"]`,
				body: (w) => {
					w.$const({ name: "id", value: "this.db.examples.size.toString()" });
					w.line("this.db.examples.set(id, { id, name: data.name })");
					w.$return("{ id, name: data.name }");
				},
			});

			w.$method({
				name: "update",
				args: [
					`id: ${m.modelTypeName}["entity"]["id"]`,
					`data: Partial<${m.modelTypeName}["entity"]>`,
				],
				type: `${m.modelTypeName}["entity"] | null`,
				body: (w) => {
					w.$const({ name: "exists", value: "this.db.examples.get(id)" });
					w.$if("!exists").then((w) => w.$return("null"));
					w.$const({ name: "newEntity", value: "{ ...exists, ...data }" });
					w.line("this.db.examples.set(id, newEntity)");
					w.$return("newEntity");
				},
			});

			w.$method({
				name: "delete",
				args: [`id: ${m.modelTypeName}["entity"]["id"]`],
				type: `boolean`,
				body: (w) => {
					w.$return("this.db.examples.delete(id)");
				},
			});
		},
	});

	return w.read();
}
