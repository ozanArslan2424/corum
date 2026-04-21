# Entity

The `Entity` function creates a schema-validated entity class. Pass a name, schema, and optional JSON schema — instances are automatically parsed (unless disabled) and typed on construction. Entity definitions are registered in the global registry and picked up by the CLI to generate TypeScript types.

> The Entity API doesn't fit the usual patterns of the Corpus package but there wasn't a good way to both create a constructor class and handle global registration with the usual patterns. Contributions are welcomed.

> Entity subclasses are not registered since the Entity function is not called. You can manually register entities using `$registry.entities.add(EntityDefinition)`.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Properties](#properties)

</section>

## Usage

Entities are created by calling `Entity()` with an `EntityDefinition` descriptor. The schema is applied synchronously on every instantiation — invalid input throws immediately.

### Basic entity

```ts
import { C } from "@ozanarslan/corpus";
import { type } from "arktype";

class Person extends C.Entity({
	name: "Person",
	schema: type({ name: "string", age: "number" }),
}) {}

const p = new Person({ name: "ozan", age: 26 });
// p.name === "ozan", p.age === 26

// Invalid input
new Person({ name: 123, age: "oops" });
```

### Entity with transformation

Schema transformations run at construction — the instance reflects the output type, not the input.

```ts
import { C } from "@ozanarslan/corpus";
import { type } from "arktype";

class Person extends C.Entity({
	name: "Person",
	schema: type({ name: "string", age: "string" }).pipe((v) => ({
		name: v.name.charAt(0).toUpperCase() + v.name.slice(1),
		age: Number(v.age),
	})),
}) {}

const p = new Person({ name: "ozan", age: "26" });
// p.name === "Ozan" (string → capitalized string)
// p.age === 26     (string → number)
```

### Adding methods and further subclassing

Classes produced by `Entity()` are abstract — extend them to add methods, then subclass further as needed.

```ts
class Person extends C.Entity({
	name: "Person",
	schema: type({ name: "string", age: "number" }),
}) {}

class Ozan extends Person {
	constructor() {
		super({ name: "Ozan", age: 26 });
	}
	greet() {
		return `hi, i'm ${this.name}`;
	}
}

const ozan = new Ozan();
ozan.greet(); // "hi, i'm Ozan"
ozan.age; // 26 (number)
```

### Disabling parsing

NOTE: Even though the instance type is still inferred, the transformations will NOT be applied. You may encounter type errors if you aren't careful.

```ts
class Person extends C.Entity({
	name: "Person",
	schema: personSchema,
	disableParsing: true,
}) {}

// No validation — values assigned directly
const p = new Person({ name: "ozan", age: 26 });
```

## Properties

These are available as static members on any class produced by `Entity()`.

| Property         | Type                            | Description                                                                  |
| ---------------- | ------------------------------- | ---------------------------------------------------------------------------- |
| `name`           | `string`                        | The entity name                                                              |
| `schema`         | `T extends Schema`              | The schema passed at definition time                                         |
| `jsonSchema`     | `EntityJsonSchema \| undefined` | Optional JSON schema for this entity                                         |
| `disableParsing` | `boolean \| undefined`          | If true, skips schema validation on construction. Values are assigned as-is. |

### name

The `name` field must be unique across your project — the CLI uses it as the identifier when generating types.

### schema

The schema used to infer types and validate input.

### jsonSchema

Optional field to define a custom JSON schema for the CLI to generate types with.

### disableParsing

Use the disableParsing property as an escape hatch when you need to construct an entity from data you've already validated, or in performance-critical paths where re-validation is unnecessary.
