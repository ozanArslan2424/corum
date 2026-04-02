# WebSocketRoute

The `WebSocketRoute` class defines a WebSocket endpoint with automatic registration to the global router. It accepts a path and a definition object containing lifecycle handlers for connection open, close, and message events. This class doesn't really do much. It's just a thin wrapper on top of Bun's websocket implementation to register it to the router. Read more here: [Bun Docs](https://bun.com/docs/runtime/http/websockets).

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)

</section>

## Usage

<section>

Routes can be instantiated directly with `new`. The constructor automatically registers the route to the global router store.

### Simple WebSocket echo

```ts
import { C } from "@ozanarslan/corpus";

// GET /ws upgrades to WebSocket
new C.WebSocketRoute("/ws", {
	onMessage: (ws, message) => {
		ws.send(`Echo: ${message}`);
	},
});
```

### Extending the abstract class

It makes sense to extend the abstract class since the definition involves 3 callbacks and can become pretty ugly.

```ts
class MyRoute extends C.WebSocketRouteAbstract {
	constructor() {
		super();
		// this method needs to be called to register it to the router
		// here or where you instantiate
		this.register();
	}

	path: string = "/ws";
	onClose?: C.WebSocketOnClose | undefined = undefined;
	onOpen?: C.WebSocketOnOpen | undefined = undefined;
	onMessage: C.WebSocketOnMessage = (ws, message) => {
		ws.send(`ECHO: ${message}`);
	};
}
```

### Full lifecycle handlers

```ts
import { C } from "@ozanarslan/corpus";

new C.WebSocketRoute("/chat", {
	onOpen: (ws) => {
		console.log("Client connected");
		ws.send("Welcome!");
	},
	onMessage: (ws, message) => {
		broadcast(message);
	},
	onClose: (ws, code, reason) => {
		console.log(`Client disconnected: ${code} ${reason}`);
	},
});
```

### Binary message handling

```ts
import { C } from "@ozanarslan/corpus";

new C.WebSocketRoute("/binary", {
	onMessage: (ws, message) => {
		if (message instanceof Buffer) {
			ws.send(message); // echo binary
		}
	},
});
```

</section>

## Constructor Parameters

<section>

### path

`E extends string`

The URL endpoint path. Always uses `GET` method (WebSocket upgrade handshake).

</section>

<section>

### definition

`WebSocketRouteDefinition`

The WebSocket lifecycle definition object.

```ts
type WebSocketRouteDefinition = {
	onOpen?: Func<[ws: CWebSocketInterface], MaybePromise<void>>;
	onClose?: Func<
		[ws: CWebSocketInterface, code?: number, reason?: string],
		MaybePromise<void>
	>;
	onMessage: Func<
		[ws: CWebSocketInterface, message: string | Buffer],
		MaybePromise<void>
	>;
};
```

| Handler     | Required | Description                                                                                                             |
| ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `onMessage` | Yes      | Called when a message is received from the client. `message` is `string` for text frames or `Buffer` for binary frames. |
| `onOpen`    | No       | Called when the WebSocket connection is established.                                                                    |
| `onClose`   | No       | Called when the connection closes. Receives close code and reason string.                                               |

</section>

## Properties

<section>

All constructor options are stored as readonly properties:

| Property    | Type                     | Description                                     |
| ----------- | ------------------------ | ----------------------------------------------- |
| `id`        | `string`                 | Unique route identifier (`{method}:{endpoint}`) |
| `method`    | `Method`                 | Fixed to `Method.GET` (WebSocket upgrade)       |
| `endpoint`  | `E`                      | Resolved path                                   |
| `handler`   | `Func`                   | Returns `this` for internal routing             |
| `model`     | `undefined`              | Not applicable for WebSocket routes             |
| `variant`   | `RouteVariant.websocket` | Fixed to `websocket` for this class             |
| `onOpen`    | `Func \| undefined`      | Connection open handler                         |
| `onClose`   | `Func \| undefined`      | Connection close handler                        |
| `onMessage` | `Func`                   | Message receive handler (required)              |

</section>
