import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";

export type WebSocketOnOpen = Func<
	[ws: CWebSocketInterface],
	MaybePromise<void>
>;
