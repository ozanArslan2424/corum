# CacheMap

The `CacheMap` class provides a simple in-memory caching mechanism with automatic value resolution. It wraps a standard `Map` and uses a provided getter function to fetch and cache values on first access. This is pretty common boilerplate code so I included it in the X module.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Methods](#methods)
4. [Code](#code)

</section>

## Usage

<section>

### Basic caching

```ts
import { X } from "@ozanarslan/corpus";

// Cache expensive database lookups
const userCache = new X.CacheMap(async (id: number) => {
	return await db.query("SELECT * FROM users WHERE id = ?", [id]);
});

// First call fetches from database
const user1 = await userCache.get(1);

// Second call returns cached value
const user1Again = await userCache.get(1);
```

### Cache invalidation

```ts
// Remove specific entry when data changes
userCache.invalidate(1);

// Clear entire cache
userCache.clear();
```

</section>

## Constructor Parameters

<section>

### getter

`Func<[key: K], MaybePromise<V>>`

Async function to resolve values when not found in cache. Called automatically on first `get()` for each key.

</section>

## Methods

<section>

### get

`async get(key: K): Promise<V>`

Returns cached value if present, otherwise calls getter, stores result, and returns it.

</section>

<section>

### invalidate

`invalidate(key: K): void`

Removes a specific key from cache. Next `get()` will refetch.

</section>

<section>

### clear

`clear(): void`

Removes all entries from cache.

</section>

## Code

```ts

```
