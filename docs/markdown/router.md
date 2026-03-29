# Router

The `Router` class is NOT part of the public Corpus API. It is automatically created by the [Server module](/docs/server) and each [Route](/docs/route), [StaticRoute](/docs/route-static), [WebSocketRoute](/docs/route-websocket), [Controller](/docs/controller), and [Middleware](/docs/middleware) object will register itself into the global router. Even though it is not part of the public API, if you really need to, you can still access the global instance by importing `$routerStore` and calling the `.get()` method.

<section class="table-of-contents">

##### Contents

1. [Router Adapters](#router-adapters)
2. [Creating Your Own Adapter](#creating-your-own-adapter)

</section>

## Router Adapters

When instantiating a new `Server`, you may optionally provide a supported adapter inside the ServerOptions.

<section>

### BranchAdapter (default)

The default router adapter, based on [@medley/router](https://github.com/medleyjs/router) by [nwoltman (Nathan Woltman)](https://github.com/nwoltman). This is an extremely fast radix-tree router. The original library is CJS only so i had to fork it for this package.
(Attributions included.)

</section>

<section>

### MemoiristAdapter

An alternative adapter layer for [memoirist](https://github.com/SaltyAom/memoirist) by [SaltyAom](https://github.com/SaltyAom). This is the router used in ElysiaJS. Requires the optional `memoirist` dependency. Also extremely fast.

```ts
import { C, MemoiristAdapter } from "@ozanarslan/corpus";

const server = new C.Server({
	adapter: new MemoiristAdapter(),
});
```

</section>

## Creating Your Own Adapter

You can implement a custom router adapter by satisfying the `RouterAdapterInterface`. The interface and supporting types are exported by name from the package.

```ts
import { C } from "@ozanarslan/corpus";
import type {
	RouterAdapterInterface,
	RouterReturnData,
	RouterRouteData,
} from "@ozanarslan/corpus";

class MyAdapter implements RouterAdapterInterface {
	add(data: RouterRouteData): void {
		// register a route
	}

	find(req: C.Request): RouterReturnData | null {
		// return matched route data, or null if not found
		// You can also throw in here and it will be handled by
		// the Server.handleError method.
	}

	// optionally return all registered routes
	list: () => Array<RouterRouteData> | undefined;
}

const server = new C.Server({
	adapter: new MyAdapter(),
});
```
