import type { WebSocketRoute } from "@/index";
import * as Bun from "bun";

export type ServerApp = Bun.Server<WebSocketRoute>;
