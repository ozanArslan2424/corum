import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export interface WebSocketHandlers {
	onOpen?: Func<[ws: CWebSocketInterface], MaybePromise<void>>;
	onClose?: Func<
		[ws: CWebSocketInterface, code?: number, reason?: string],
		MaybePromise<void>
	>;
	onMessage: Func<
		[ws: CWebSocketInterface, message: string | Buffer],
		MaybePromise<void>
	>;
}
