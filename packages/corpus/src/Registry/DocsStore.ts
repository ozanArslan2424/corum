import type { EntityDefinition } from "@/Entity/EntityDefinition";

export class EntityStore {
	private readonly map = new Map<string, EntityDefinition>();

	add(def: EntityDefinition) {
		this.warnOverride(def.name);
		this.map.set(def.name, def);
	}

	find(name: string): EntityDefinition | null {
		return this.map.get(name) ?? null;
	}

	private warnOverride(name: string) {
		if (this.map.has(name)) {
			console.error(
				`Entity name "${name}" will override an existing entry.\nChange to a unique name to avoid this override.`,
			);
		}
	}
}
