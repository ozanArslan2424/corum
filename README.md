# Tabula Corpus

A very simple typescript backend framework package to use for personal projects or simple crud applications.
This package is by no means a replacement for full fledged backend frameworks commonly used in production.

## Quick Start

Install the package:

```bash
bun add @tabula/corpus
```

```bash
npm install @tabula/corpus
```

Create a simple server:

```typescript
import { Server, Route, Config } from "@tabula/corpus";

// Initialize server
const server = new Server();

// Add a route
new Route("/health", () => "ok");

// Start listening
server.listen(3000);
```

That's it. Your bare bones backend is running.

## What does this library do?

- Registering routes using `Route` or `Controller`
- Registering static pages using `StaticRoute` or `Controller`
- Registering middlewares using `Middleware`
- Request data validation based on libraries using Standard Schema (e.g. arktype and zod)
- Request handling using `RouteContext` (the `(c) => {}` callback pattern)
- Loading env variables using `Config`
- Other utilities such as setting cors, global prefix, error handling etc.

## How does the routing work?

- Routes, route models and middlewares are lazily registered to their respective registries on class initialization. Router uses the registries and is created with the Server object. The Server should be created before any route, controller or middleware.
- Router is RegExp based and supports route parameters.
- The router isn't very advanced since this is my very first time working on such a project, I appreciate all feedback.

## Runtime?

Originally I wanted to support Node and Bun runtimes but to be honest, I didn't test with node at all because I almost always prefer Bun in my personal projects and this library is meant to be used for small personal projects. Maybe I'll get back to the idea later on.

## What is the pattern I had in mind?

```typescript
// You can also use something else
import { type } from "arktype";
// You can also import everything by name
import C from "@tabula/corpus";

// You can use schemas however you want, I just really like this.
export class ItemModel {
	static entity = type({
		id: "number",
		createdAt: "string.date.iso",
		name: "string",
	});
	static create = {
		body: this.entity.omit("id", "createdAt"),
	};
}

// This helper type could also work for similar prototypes
export type ItemType = C.InferModel<typeof ItemModel>;

// This is also a personal helper, all repositories get
// the DatabaseClientInterface in constructor args.
// This interface can be extended.
export class ItemRepository extends C.Repository {
	// ...
}

// Service layer isn't included, it's just a good idea
export class ItemService {
	constructor(private readonly itemRepository: ItemRepository) {}

	create(body: ItemType["create"]["body"]) {
		// ...
	}
}

// Controller is an abstract class
export class ItemController extends C.Controller {
	constructor(private readonly itemService: ItemService) {
		super({ prefix: "/item" });
	}

	// Helper instead of new Route()
	create = this.route(
		{ method: "POST", path: "/create" },
		(c) => this.itemService.create(c.body),
		ItemModel.create,
	);

	// Static routes can also be in the controller instead of new StaticRoute()
	page = this
		.staticRoute
		// ...
		();
}

// Server must be created first for the router
const server = new C.Server();
// This DOES NOT apply to static routes
server.setGlobalPrefix("/api");

// Cors headers are applied globally if you set them this way also
// any request with Access-Control-Request-Method header and OPTIONS
// method is handled as a preflight request.
server.setCors({});

const db = new DatabaseClient();
server.setOnBeforeListen(() => db.connect());
server.setOnBeforeExit(() => db.disconnect());

// There isn't any automatic dependency injection because i don't like it,
// you can create your objects in whatever order you like
const itemRepository = new ItemRepository(db);
const itemService = new ItemService(itemRepository);
new ItemController(itemService);
new C.Route("/health", () => "ok");

// Config is a helper with a couple of methods for paths and vars.
server.listen(
	C.Config.get("PORT", { parser: parseInt, fallback: 3000 }),
	"0.0.0.0",
);
```

## What interfaces can be extended

```typescript
declare module "@tabula/corpus" {
	// process.env basically
	interface Env {}

	// Any data assigned to c.data anywhere
	interface ContextDataInterface {}

	// The database client class I use in my app
	interface DatabaseClientInterface extends DatabaseClient {}
}
```

# Closing thoughts

As I mentioned multiple times, this is not for production. It's also my first ever personal project at this scale. I am very open to suggestions (maybe even pull requests). Thank you for being here.

Very much inspired from the core ideas behind [Elysia](https://github.com/elysiajs/elysia)

# Roadmap

- [ ] Better and more memory efficient router
- [ ] Reduce dist size
- [ ] Support ArrayBuffer in custom Response wrapper object
- [ ] Support Blob in custom Response wrapper object
- [ ] Support FormData in custom Response wrapper object
- [ ] Support URLSearchParams in custom Response wrapper object
- [ ] Support ReadableStream in custom Response wrapper object
- [ ] Support WebSocket
- [ ] Compress static files in StaticRoute for caching and stuff maybe?
- [ ] Better everything
