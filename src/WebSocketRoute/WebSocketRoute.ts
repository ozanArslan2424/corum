import { $routerStore } from "@/index";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { RouteId } from "@/Route/types/RouteId";
import type { OrString } from "@/utils/types/OrString";
import type { WebSocketHandlers } from "@/WebSocketRoute/types/WebSocketHandlers";
import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";

export class WebSocketRoute<
	Path extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<Path, B, S, P, WebSocketRoute> {
	constructor(path: Path, handlers: WebSocketHandlers) {
		super();
		this.endpoint = path;
		this.method = Method.GET;
		this.pattern = this.resolvePattern(this.endpoint);
		this.id = this.resolveId(this.method, this.endpoint);
		this.onOpen = handlers.onOpen;
		this.onClose = handlers.onClose;
		this.onMessage = handlers.onMessage;
		$routerStore.get().addRoute(this);
	}

	id: RouteId;
	method: OrString<Method>;
	endpoint: Path;
	pattern: RegExp;
	model?: RouteModel<B, S, P, WebSocketRoute>;
	handler: RouteHandler<B, S, P, WebSocketRoute> = () => this as WebSocketRoute;
	variant: RouteVariant = RouteVariant.websocket;

	readonly onOpen?: Func<[ws: CWebSocketInterface], MaybePromise<void>>;
	readonly onClose?: Func<
		[ws: CWebSocketInterface, code?: number, reason?: string],
		MaybePromise<void>
	>;
	readonly onMessage: Func<
		[ws: CWebSocketInterface, message: string | Buffer],
		MaybePromise<void>
	>;
}
