import { $routerStore } from "@/index";
import { RouteAbstract } from "@/Route/RouteAbstract";
import { Method } from "@/CRequest/enums/Method";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import type { Func } from "@/utils/types/Func";
import type { MaybePromise } from "@/utils/types/MaybePromise";
import type { Context } from "@/Context/Context";
import type { WebSocketRouteDefinition } from "@/Route/types/WebSocketRouteDefinition";

type R = WebSocketRoute;

export class WebSocketRoute<
	E extends string = string,
> extends RouteAbstract<E> {
	constructor(path: E, definition: WebSocketRouteDefinition) {
		super();
		this.endpoint = path;
		this.method = Method.GET;
		this.id = this.resolveId(this.method, this.endpoint);
		this.onOpen = definition.onOpen;
		this.onClose = definition.onClose;
		this.onMessage = definition.onMessage;
		$routerStore.get().addRoute(this);
	}

	id: string;
	method: Method;
	endpoint: E;
	model = undefined;
	handler: Func<[Context], MaybePromise<R>> = () => this;
	variant: RouteVariant = RouteVariant.websocket;

	readonly onOpen?: WebSocketRouteDefinition["onOpen"];
	readonly onClose?: WebSocketRouteDefinition["onClose"];
	readonly onMessage: WebSocketRouteDefinition["onMessage"];
}
