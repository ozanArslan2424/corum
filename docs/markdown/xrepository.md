# XRepository

The `XRepository` class provides an abstract base for database repository implementations. It accepts a database client through its constructor, establishing the foundation for data access patterns in your application. Honestly, I just got really tired of writing the constructor by hand and that's why this class exists.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Extending](#extending)

</section>

## Usage

<section>

### Basic repository implementation

```ts
import { X } from "@ozanarslan/corpus";

// Extend with your database client type
class UserRepository extends X.Repository {
	async findById(id: number) {
		return this.db.query("SELECT * FROM users WHERE id = ?", [id]);
	}

	async create(data: { name: string; email: string }) {
		return this.db.insert("users", data);
	}
}

// Usage
const repo = new UserRepository(dbClient);
const user = await repo.findById(1);
```

### With typed database client

```ts
import type { Pool } from "pg";

// Extend DatabaseClientInterface via module augmentation
declare module "@ozanarslan/corpus" {
	interface DatabaseClientInterface extends Pool {}
}

class PostgresRepository extends X.Repository {
	async findAll() {
		return this.db.query("SELECT * FROM items");
	}
}
```

</section>

## Constructor Parameters

<section>

### `db`

`DatabaseClientInterface`

The database client instance. Type can be extended via module augmentation to match your specific database driver (prisma, pg, mysql2, better-sqlite3, etc.).

</section>

## Extending

<section>

### Module augmentation

Extend `DatabaseClientInterface` to get full type safety for your database client:

```ts
import type { Pool } from "pg";

declare module "@ozanarslan/corpus" {
	interface DatabaseClientInterface extends Pool {}
}
```

See [Extensibility](/docs/intro#extensibility) for other extendable interfaces.

</section>
