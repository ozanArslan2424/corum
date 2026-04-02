import type { WebSocketRouteDefinition } from "@/Route/types/WebSocketRouteDefinition";
import { WebSocketRouteAbstract } from "@/Route/WebSocketRouteAbstract";

export class WebSocketRoute<
	E extends string = string,
> extends WebSocketRouteAbstract<E> {
	constructor(
		readonly path: E,
		definition: WebSocketRouteDefinition,
	) {
		super();
		this.onOpen = definition.onOpen;
		this.onClose = definition.onClose;
		this.onMessage = definition.onMessage;
		this.register();
	}

	readonly onOpen?: WebSocketRouteDefinition["onOpen"];
	readonly onClose?: WebSocketRouteDefinition["onClose"];
	readonly onMessage: WebSocketRouteDefinition["onMessage"];
}
