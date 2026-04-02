# Middleware

The Middleware class registers inbound or outbound middleware into the global router. Inbound middleware runs before route handlers; outbound middleware runs after. Both variants receive the request context and can return a [CResponse](/docs/response) to short-circuit the request, or void to continue.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)

</section>

## Usage

<section>

As with many modules, the Middleware class can be instantiated directly with new or extended using the abstract class. The middlewares are automatically registered and inserted into the lifecycle inside the constructor.

### With new

```ts
import { C } from "@ozanarslan/corpus";

const server = new C.Server();

new C.Middleware({
	variant: "inbound",
	useOn: "*",
	handler: async (c) => {
		if (!c.headers.get("authorization")) {
			return new C.Response("Unauthorized", { status: 401 });
		}
	},
});

void server.listen(3000);
```

### Extending

```ts
import { C } from "@ozanarslan/corpus";
import { SomeService } from "./SomeService";

class SomeMiddleware extends C.MiddlewareAbstract {
	constructor(
		private readonly someService: SomeService,
		override readonly useOn: C.MiddlewareUseOn,
	) {
		super();
		// this method needs to be called to register it to the router
		// here or where you instantiate
		this.register();
	}

	override handler: C.MiddlewareHandler = (c) => {
		return this.someService.fn(c.headers);
	};
}

const server = new C.Server();
const someRoute = new C.Route("/", () => "ok");
const someService = new SomeService();
new SomeMiddleware(someService, { useOn: [someRoute] });
void server.listen(3000);
```

</section>

## Constructor Parameters

<section>

### `variant`

Either "inbound" or "outbound". Defaults to "inbound". Inbound middlewares run before the handlers and outbound middlewares run after. Mental model if coming from NestJS:

| Corpus                                  | NestJS                                           |
| --------------------------------------- | ------------------------------------------------ |
| Inbound Middleware returning void       | Middleware (calling `next()`)                    |
| Outbound Middleware returning void      | Interceptor (post-handler, returning observable) |
| Inbound Middleware returning CResponse  | Guard returning `false` or throwing              |
| Outbound Middleware returning CResponse | Exception Filter catching and transforming       |
| Inbound Middleware throwing             | Guard or Middleware throwing                     |
| Outbound Middleware throwing            | Interceptor or Exception Filter throwing         |

</section>

<section>

### `useOn`

The route(s) and controller(s) this middleware applies to. Pass `"*"` to apply globally to all routes.

```ts
export type MiddlewareUseOn =
	| Array<RouteInterface | Controller>
	| RouteInterface
	| Controller
	| "*";
```

</section>

<section>

### `handler`

The middleware function. Receives the request context and can return a CResponse or throw and error to halt further processing, or void to pass through.

</section>

## Properties

All constructor options are stored as readonly properties: `variant`, `useOn`, and `handler`.
