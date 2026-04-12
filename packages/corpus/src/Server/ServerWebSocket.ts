import type { WebSocketRoute } from "@/WebSocketRoute/WebSocketRoute";

export interface ServerWebSocket extends Bun.ServerWebSocket<
	WebSocketRoute<string>
> {}
