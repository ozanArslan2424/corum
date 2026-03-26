import { $routerStore } from "@/index";
import type { RouteModel } from "@/Model/types/RouteModel";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { RouteId } from "@/Route/types/RouteId";
import type { OrString } from "@/utils/types/OrString";
import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";

type R = WebSocketRoute;

export class WebSocketRoute<
	E extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<E, B, S, P, R> {
	constructor(
		path: E,
		handlers: {
			onOpen?: Func<[ws: CWebSocketInterface], MaybePromise<void>>;
			onClose?: Func<
				[ws: CWebSocketInterface, code?: number, reason?: string],
				MaybePromise<void>
			>;
			onMessage: Func<
				[ws: CWebSocketInterface, message: string | Buffer],
				MaybePromise<void>
			>;
		},
	) {
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
	endpoint: E;
	pattern: RegExp;
	model?: RouteModel<B, S, P, R>;
	handler: RouteHandler<B, S, P, R> = () => this as R;
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
