import type { __Coreum_Method } from "../Method/__Coreum_Method";
import type { __Coreum_Endpoint } from "./__Coreum_Endpoint";

export type __Coreum_RouteDefinition =
	| { method: __Coreum_Method; path: __Coreum_Endpoint }
	| __Coreum_Endpoint;
