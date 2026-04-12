import { $registry } from "@/index";
import { RouteAbstract } from "@/Route/RouteAbstract";
import { RouteVariant } from "@/Route/RouteVariant";
import type { Context } from "@/Context/Context";
import { Method } from "@/CRequest/Method";
import type { WebSocketRouteDefinition } from "@/WebSocketRoute/WebSocketRouteDefinition";
import type { Func } from "corpus-utils/Func";
import { joinPathSegments } from "corpus-utils/joinPathSegments";

type R = WebSocketRouteAbstract;

export abstract class WebSocketRouteAbstract<
	E extends string = string,
> extends RouteAbstract<E> {
	// FROM CONSTRUCTOR
	abstract readonly path: E;

	abstract readonly onOpen?: WebSocketRouteDefinition["onOpen"];

	abstract readonly onClose?: WebSocketRouteDefinition["onClose"];

	abstract readonly onMessage: WebSocketRouteDefinition["onMessage"];

	// BASE ROUTE PROPERTIES
	variant: RouteVariant = RouteVariant.websocket;

	get endpoint(): string {
		return joinPathSegments($registry.prefix, this.path);
	}

	get method(): Method {
		return Method.GET;
	}

	get handler(): Func<[Context], R> {
		return () => this;
	}

	model = undefined;
}
