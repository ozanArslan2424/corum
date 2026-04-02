# Route

The Route (DynamicRoute internally) class defines an HTTP endpoint with automatic registration to the global router. It accepts a flexible definition (either a path string or an object with `method` and `path`) and a handler that receives the request context. Routes can optionally include a model for request/response validation and type safety.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)

</section>

## Usage

<section>

Routes can be instantiated directly with `new`. The constructor automatically registers the route to the global router store.

### Simple GET route

```ts
import { C } from "@ozanarslan/corpus";

// GET /users
new C.Route("/users", () => [{ id: 1, name: "Alice" }]);
```

### Extending the abstract class

I wouldn't recommend extending since the model parsing basically becomes useless.

```ts
class MyRoute extends C.RouteAbstract {
	constructor() {
		super();
		// this method needs to be called to register it to the router
		// here or where you instantiate
		this.register();
	}

	definition: C.RouteDefinition<string> = "/extended";
	callback: C.RouteCallback = () => "extended";
	model?: C.RouteModel | undefined = undefined;
}
```

### Route with specific HTTP method

```ts
import { C } from "@ozanarslan/corpus";

// POST /users
new C.Route({ method: C.Method.POST, path: "/users" }, (c) => {
	return { created: c.body.name };
});
```

### Route with validation model

```ts
import { C } from "@ozanarslan/corpus";
import { z } from "zod";

const UserModel = {
	body: z.object({ name: z.string(), email: z.email() }),
	response: z.object({ id: z.number(), name: z.string() }),
};

new C.Route(
	{ method: C.Method.POST, path: "/users" },
	(c) => {
		// c.body is typed as { name: string; email: string }
		return { id: 1, name: c.body.name };
	},
	UserModel,
);
```

### Handler return types

Handlers can return:

- **Plain data** — automatically wrapped in `CResponse` (objects → JSON, strings → text, etc.) with applied headers.
- **`CResponse`** — for custom status codes, headers, or response control

```ts
// Automatic JSON response
new C.Route("/users", () => ({ users: [] }));

// Custom CResponse
new C.Route("/error", () => {
	return new C.Response("Not Found", { status: 404 });
});
```

</section>

## Constructor Parameters

<section>

### definition

`string | { method: Method; path: string }`

The route definition. If a string is provided, defaults to `GET`. For other HTTP methods, use the object form.

| Value                                       | Result        |
| ------------------------------------------- | ------------- |
| `"/users"`                                  | `GET /users`  |
| `{ method: C.Method.POST, path: "/users" }` | `POST /users` |

</section>

<section>

### handler

`(context: Context<B, S, P, R>) => MaybePromise<R>`

The route handler function. Receives the request context with typed access to body (`c.body`), search params (`c.search`), URL params (`c.params`), CRequest (`c.req`), and CResponse for response manipulation without returning a CResponse (`c.res`).

</section>

<section>

### model (optional)

`RouteModel<B, S, P, R>`

Optional validation model for the request body, search params, URL params, and response. When provided, the context properties are typed and validated automatically. See [Model](/docs/model). You can pass generics if you don't want to bother with validation but still typecast your data: `RouteInterface<B, S, P, R, E extends string> `

```ts
// type Schema is any standard schema library validator.
type RouteModel<B = unknown, S = unknown, P = unknown, R = unknown> = {
	response?: Schema<R>;
	body?: Schema<B>;
	search?: Schema<S>;
	params?: Schema<P>;
};
```

</section>

## Properties

<section>

All constructor options are stored as readonly properties after resolve methods:

| Property   | Type                      | Description                                     |
| ---------- | ------------------------- | ----------------------------------------------- |
| `id`       | `string`                  | Unique route identifier (`{method}:{endpoint}`) |
| `method`   | `Method`                  | HTTP method enum value                          |
| `endpoint` | `E`                       | Resolved path                                   |
| `handler`  | `Func`                    | The route handler function                      |
| `model`    | `RouteModel \| undefined` | Validation model if provided                    |
| `variant`  | `RouteVariant.dynamic`    | Fixed to `dynamic` for this class               |

</section>
