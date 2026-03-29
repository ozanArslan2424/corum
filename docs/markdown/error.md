# CError

The `CError` class extends native `Error` with HTTP status codes and optional data payload. It provides a `toResponse()` method for converting errors into `CResponse` objects, making it ideal for consistent error handling across your application.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)
4. [Methods](#methods)

</section>

## Usage

<section>

### Throwing errors in routes

```ts
import { C } from "@ozanarslan/corpus";

new C.Route("/users/:id", (c) => {
	const user = findUser(c.params.id);

	if (!user) {
		throw new C.Error("User not found", C.Status.NOT_FOUND);
	}

	return user;
});
```

### With custom data payload

```ts
new C.Route("/validate", (c) => {
	const errors = validate(c.body);

	if (errors.length > 0) {
		throw new C.Error("Validation failed", C.Status.BAD_REQUEST, { errors });
	}

	return { valid: true };
});
```

### Converting to response

```ts
new C.Route("/handle", async (c) => {
	try {
		return await riskyOperation();
	} catch (err) {
		if (err instanceof C.Error) {
			// this is already done in the Server.handleError
			return err.toResponse();
		}
		throw err;
	}
});
```

### Checking error status

```ts
new C.Middleware({
	variant: "inbound",
	useOn: "*",
	handler: (c) => {
		try {
			return c.next();
		} catch (err) {
			if (err instanceof C.Error && err.isStatusOf(C.Status.UNAUTHORIZED)) {
				c.res.headers.set("X-Auth-Required", "true");
			}
			throw err;
		}
	},
});
```

</section>

## Constructor Parameters

<section>

### message

`string`

The error message. Available on `error.message`.

</section>

<section>

### status

`Status`

HTTP status code for this error. Use `C.Status` enum for standard codes.

</section>

<section>

### data (optional)

`unknown`

Additional data to include in the response. If a `CResponse` is passed, it will be modified with the status code and returned as-is from `toResponse()`.

</section>

## Properties

<section>

| Property | Type      | Description                          |
| -------- | --------- | ------------------------------------ |
| message  | `string`  | Error message (inherited from Error) |
| status   | `Status`  | HTTP status code                     |
| data     | `unknown` | Optional additional payload          |

</section>

## Methods

<section>

### toResponse

`toResponse(): CResponse`

Converts the error to a `CResponse`:

- If `data` is a `CResponse` — returns it with `status` applied
- Otherwise — returns JSON response with `{ error, message }` shape

```ts
// With plain data
new C.Error("Not found", C.Status.NOT_FOUND).toResponse();
// → CResponse with body { error: true, message: "Not found" }

// With CResponse data
new C.Error(
	"Failed",
	C.Status.BAD_REQUEST,
	new C.Response("custom"),
).toResponse();
// → The passed CResponse with status 400
```

</section>

<section>

### isStatusOf

`isStatusOf(status: Status): boolean`

Checks if the error matches a specific HTTP status code.

```ts
const err = new C.Error("Not found", C.Status.NOT_FOUND);
err.isStatusOf(C.Status.NOT_FOUND); // true
err.isStatusOf(C.Status.BAD_REQUEST); // false
```

</section>
