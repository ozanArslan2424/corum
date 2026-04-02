import type { WebSocketOnClose } from "@/Route/types/WebSocketOnClose";
import type { WebSocketOnMessage } from "@/Route/types/WebSocketOnMessage";
import type { WebSocketOnOpen } from "@/Route/types/WebSocketOnOpen";

export type WebSocketRouteDefinition = {
	onOpen?: WebSocketOnOpen;
	onClose?: WebSocketOnClose;
	onMessage: WebSocketOnMessage;
};
