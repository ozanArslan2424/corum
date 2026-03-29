# Cookies

The `Cookies` class provides a unified interface for managing HTTP cookies with support for parsing request cookies and generating `Set-Cookie` headers. It wraps the underlying platform cookie implementation (Bun's CookieMap) with a consistent API.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)
4. [Methods](#methods)

</section>

## Usage

<section>

### Reading request cookies

```ts
import { C } from "@ozanarslan/corpus";

new C.Route("/profile", (c) => {
	// Get single cookie
	const sessionId = c.cookies.get("sessionId");

	// Check existence
	if (c.cookies.has("preferences")) {
		// ...
	}

	// Iterate all cookies
	for (const [name, value] of c.cookies.entries()) {
		console.log(`${name}: ${value}`);
	}

	return { sessionId };
});
```

### Setting response cookies

```ts
new C.Route("/login", (c) => {
	// Set single cookie
	c.res.cookies.set({
		name: "sessionId",
		value: "abc123",
		httpOnly: true,
		secure: true,
		maxAge: 3600,
		path: "/",
	});

	// Set multiple cookies
	c.res.cookies.setMany([
		{ name: "user", value: "john", path: "/" },
		{ name: "prefs", value: "dark", maxAge: 86400 },
	]);

	return { loggedIn: true };
});
```

### Deleting cookies

```ts
new C.Route("/logout", (c) => {
	c.res.cookies.delete("sessionId");

	return { loggedOut: true };
});
```

</section>

## Constructor Parameters

<section>

### init (optional)

`CookieOptions | CookieOptions[] | CookiesInterface`

Initial cookie data. Accepts a single cookie options object, an array of cookie options, or another `CookiesInterface` instance.

```ts
// Single cookie
new C.Cookies({ name: "session", value: "abc", path: "/" });

// Multiple cookies
new C.Cookies([
	{ name: "a", value: "1" },
	{ name: "b", value: "2" },
]);

// From existing interface
new C.Cookies(existingCookies);
```

</section>

## Properties

<section>

| Property | Type     | Description                             |
| -------- | -------- | --------------------------------------- |
| count    | `number` | Number of cookies in the store (getter) |

</section>

## Methods

<section>

### get

`get(name: string): string | null`

Retrieves a cookie value by name.

</section>

<section>

### has

`has(name: string): boolean`

Checks if a cookie exists.

</section>

<section>

### set

`set(opts: CookieOptions): void`

Sets a cookie with options.

```ts
type CookieOptions = {
	name: string;
	value: string;
	domain?: string;
	/** Defaults to '/'. */
	path?: string;
	expires?: number | Date;
	secure?: boolean;
	/** Defaults to `lax`. */
	sameSite?: "strict" | "lax" | "none";
	httpOnly?: boolean;
	partitioned?: boolean;
	maxAge?: number;
};
```

</section>

<section>

### setMany

`setMany(optsArr: Array<CookieOptions>): void`

Sets multiple cookies at once.

</section>

<section>

### delete

`delete(name: string): void`

Removes a cookie by name.

</section>

<section>

### entries

`entries(): IterableIterator<[string, string]>`

Returns an iterator of all cookie name/value pairs.

</section>

<section>

### keys

`keys(): Array<string>`

Returns all cookie names.

</section>

<section>

### values

`values(): Array<string>`

Returns all cookie values.

</section>

<section>

### toSetCookieHeaders

`toSetCookieHeaders(): Array<string>`

Generates `Set-Cookie` header strings for all set cookies. Called automatically when building the response.

</section>
