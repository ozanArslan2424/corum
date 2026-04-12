import type { WebSocketRoute } from "@/index";
import * as Bun from "bun";

export type ServerWebSocketHandler = Bun.WebSocketHandler<WebSocketRoute>;
