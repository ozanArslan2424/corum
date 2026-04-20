# Router

The `Router` class is NOT part of the public Corpus API. It is automatically created by the [Server module](/docs/server) and each [Route](/docs/route), [StaticRoute](/docs/route-static), [WebSocketRoute](/docs/route-websocket), [Controller](/docs/controller), and [Middleware](/docs/middleware) object will register itself into the global router. Even though it is not part of the public API, if you really need to, you can still access the global instance by importing `$registry.router`.

<section class="table-of-contents">

##### Contents

1. [Router Adapters](#router-adapters)
2. [Creating Your Own Adapter](#creating-your-own-adapter)

</section>

## Router Adapters

When instantiating a new `Server`, you may optionally provide a supported adapter inside the ServerOptions. Provided adapters are part of the X module.

<section>

### BranchAdapter (default)

The default router adapter, based on [@medley/router](https://github.com/medleyjs/router) by [nwoltman (Nathan Woltman)](https://github.com/nwoltman). This is an extremely fast radix-tree router. The original library is CJS only so i had to fork it for this package.
(Attributions included.)

</section>

<section>

### MemoiristAdapter

An alternative adapter layer for [memoirist](https://github.com/SaltyAom/memoirist) by [SaltyAom](https://github.com/SaltyAom). This is the router used in ElysiaJS. Requires the `memoirist` dependency. Also extremely fast. Copy and paste from [Router DIY](/docs/router/diy/memoirist-adapter) and pass to the adapter parameter.

```ts
import { C } from "@ozanarslan/corpus";
import { MemoiristAdapter } from "./MemoiristAdapter";

const server = new C.Server({
	adapter: new MemoiristAdapter(),
});
```

</section>

## Creating Your Own Adapter

You can implement a custom router adapter by satisfying the `RouterAdapterInterface`. The interface and supporting types are exported by name from the package. You can also see the example from the DIY tab.

```ts
import { C } from "@ozanarslan/corpus";
import type { RouterAdapterInterface, RouterReturn, RouterData } from "@ozanarslan/corpus";

class MyAdapter implements RouterAdapterInterface {
	add(data: RouterData): void {
		// register a route
	}

	find(req: C.Req): RouterReturn | null {
		// return matched route data, or null if not found
		// You can also throw in here and it will be handled by
		// the Server.handleError method.
	}

	// optionally return all registered routes
	list: (() => Array<RouterData>) | undefined;
}

const server = new C.Server({
	adapter: new MyAdapter(),
});
```
