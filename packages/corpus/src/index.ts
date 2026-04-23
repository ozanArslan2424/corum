import * as C from "./C";
import { Registry } from "./Registry/Registry";
import * as X from "./X";

export const $registry = new Registry();

export * from "./Router/Router";

export * from "./MiddlewareRouter/MiddlewareRouterInterface";
export * from "./Parser/BodyParserInterface";
export * from "./Parser/ObjectParserInterface";
export * from "./Parser/SchemaParserInterface";
export * from "./Router/RouterInterface";
export * from "./RouterAdapter/RouterAdapterInterface";
export * from "./XCors/XCorsInterface";
export * from "./Registry/RegistryInterface";

export type * from "./types.d.ts";

export * from "./C";
export { C, C as Corpus };

export * from "./X";
export { X, X as Extra };
