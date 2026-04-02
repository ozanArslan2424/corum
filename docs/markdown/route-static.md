# StaticRoute

The `StaticRoute` class defines a route that serves static files with automatic registration to the global router. It accepts a path and a file definition (either a plain path string or an object with `stream: true` for large files for download). An optional custom handler can intercept file content before sending to modify response or transform content.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)

</section>

## Usage

<section>

Routes can be instantiated directly with `new`. The constructor automatically registers the route to the global router store.

### Simple file serve

```ts
import { C } from "@ozanarslan/corpus";

function addr(...path: string[]) {
	return X.Config.resolvePath(X.Config.cwd(), ...path);
}

// GET /style serves assets/style.css
new C.StaticRoute("/style", addr("assets", "style.css"));
```

### Streaming large files

```ts
import { C } from "@ozanarslan/corpus";

// Stream video directly from disk
new C.StaticRoute("/video", {
	filePath: addr("assets", "video.mp4"),
	stream: true,
});
```

### Custom handler

```ts
import { C } from "@ozanarslan/corpus";

// Modify response and content before sending
new C.StaticRoute("/doc", "assets/doc.txt", (c, content) => {
	c.res.headers.set("x-custom", "value");
	return content.replaceAll("hello", "world");
});
```

### Extending the abstract class

I wouldn't recommend extending since the model parsing basically becomes useless.

```ts
class MyRoute extends C.StaticRouteAbstract {
	constructor() {
		super();
		// this method needs to be called to register it to the router
		// here or where you instantiate
		this.register();
	}

	path: string = "/extended";
	definition: C.StaticRouteDefinition = {
		filePath: addr("assets", "video.mp4"),
		stream: true,
	};
	callback: C.StaticRouteCallback = () => "extended";
	model?: C.RouteModel | undefined = undefined;
}
```

</section>

## Constructor Parameters

<section>

### path

`E extends string`

The URL endpoint path. Always uses `GET` method.

</section>

<section>

### definition

```ts
type StaticRouteDefinition =
	// just the file path, doesn't stream
	| string
	| {
			filePath: string;
			stream: true;
			// defaults to attachment
			disposition?: "attachment" | "inline";
	  };
```

The file definition. If a string is provided, serves the file normally. Use the object form with `stream: true` for large files to stream directly from disk without loading into memory.

| Value                                            | Behavior               |
| ------------------------------------------------ | ---------------------- |
| `"style.css"`                                    | Standard file response |
| `{ filePath: "assets/video.mp4", stream: true }` | Streams file from disk |

</section>

<section>

### `handler` (optional)

`(context: Context<B, S, P, R>, content: string) => MaybePromise<R>`

Optional custom handler to intercept file content before sending. Receives the context and file content as string. Use `c.res.headers` to modify response headers. Must return string or a `CResponse`.

```ts
(c, content) => {
	c.res.headers.set("x-custom", "value");
	return content; // or return new C.Response(...)
};
```

</section>

<section>

### model (optional)

`RouteModel<B, S, P, R>`

Optional validation model for search params and response. See [Model](/docs/model). You can pass generics if you don't want to bother with validation but still typecast your data: `StaticRoute<B, S, P, E>`

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

| Property   | Type                                                   | Description                                       |
| ---------- | ------------------------------------------------------ | ------------------------------------------------- |
| `id`       | `string`                                               | Unique route identifier (`{method}:{endpoint}`)   |
| `method`   | `Method`                                               | Fixed to `Method.GET`                             |
| `endpoint` | `E`                                                    | Resolved path                                     |
| `handler`  | `Func<[Context<B, S, P, R>, string], MaybePromise<R>>` | The route handler function (file serve or custom) |
| `model`    | `RouteModel \| undefined`                              | Validation model if provided                      |
| `variant`  | `RouteVariant.static`                                  | Fixed to `static` for this class                  |

</section>
