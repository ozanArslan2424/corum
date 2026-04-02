import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type WebSocketOnMessage = Func<
	[ws: CWebSocketInterface, message: string | Buffer],
	MaybePromise<void>
>;
