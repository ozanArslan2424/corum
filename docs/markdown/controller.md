# Controller

The `Controller` class provides a base for grouping related routes under a shared URL prefix and optional middleware. Extend this class to organize your application into logical units (e.g., `UserController`, `PostController`). Routes registered via `route()` and `staticRoute()` automatically inherit the controller's prefix and run `beforeEach` before the handler if set.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)
4. [Methods](#methods)

</section>

## Usage

<section>

Controllers are created by extending the `Controller` class and instantiating the subclass. Routes are defined as class properties using `this.route()` or `this.staticRoute()`. This is an abstract class you cannot instantiate it directly.

### Basic controller

```ts
import { C } from "@ozanarslan/corpus";

class UserController extends C.Controller {
	constructor() {
		super({ prefix: "/users" });
	}

	getAll = this.route("/", () => getAllUsers());

	getById = this.route("/:id", (c) => getUser(c.params.id));

	create = this.route({ method: C.Method.POST, path: "/" }, (c) => {
		return createUser(c.body);
	});
}

// Creates: GET /users, GET /users/:id, POST /users
new UserController();
```

### Controller with beforeEach middleware

```ts
import { C } from "@ozanarslan/corpus";

class ProtectedController extends C.Controller {
	constructor() {
		super({
			prefix: "/admin",
			beforeEach: async (c) => {
				if (!c.headers.has("authorization")) {
					throw new C.Error("Unauthorized", 401);
				}
			},
		});
	}

	dashboard = this.route("/", () => "Admin panel");
	stats = this.route("/stats", () => getStats());
}

// All routes run auth check before handler
new ProtectedController();
```

### Controller with static routes

```ts
import { C } from "@ozanarslan/corpus";

class AssetController extends C.Controller {
	constructor() {
		super({ prefix: "/assets" });
	}

	logo = this.staticRoute("/logo", "assets/logo.png");

	video = this.staticRoute("/trailer", {
		filePath: "assets/trailer.mp4",
		stream: true,
	});
}

// Creates: GET /assets/logo, GET /assets/trailer
new AssetController();
```

</section>

## Constructor Parameters

<section>

### opts (optional)

`{ prefix?: string; beforeEach?: (context: Context) => MaybePromise<void> }`

| Option       | Type     | Description                                                  |
| ------------ | -------- | ------------------------------------------------------------ |
| `prefix`     | `string` | URL prefix prepended to all routes in this controller        |
| `beforeEach` | `Func`   | Middleware run before every route handler in this controller |

</section>

## Properties

<section>

| Property     | Type                  | Description                                     |
| ------------ | --------------------- | ----------------------------------------------- |
| `prefix`     | `string \| undefined` | The controller's URL prefix                     |
| `beforeEach` | `Func \| undefined`   | Optional middleware run before each handler     |
| `routeIds`   | `Set<string>`         | Set of registered route IDs for this controller |

</section>

## Methods

<section>

### route

`protected route(definition, handler, model?) => DynamicRoute`

Registers a dynamic route under this controller. Identical to `new DynamicRoute()` but automatically prepends the controller prefix and wraps the handler with `beforeEach` if set.

```ts
this.route("/", () => "hello");
this.route({ method: C.Method.POST, path: "/" }, (c) => c.body);
this.route("/:id", (c) => c.params.id, { params: IdModel });
```

</section>

<section>

### staticRoute

`protected staticRoute(path, definition, handler?, model?) => StaticRoute`

Registers a static file route under this controller. Identical to `new StaticRoute()` but automatically prepends the controller prefix.

```ts
this.staticRoute("/file", "assets/file.txt");
this.staticRoute("/video", { filePath: "assets/video.mp4", stream: true });
```

</section>
