import type { __Coreum_Server } from "@/lib/Server/__Coreum_Server";

/**
 * Server is the entrypoint to the app.
 * It takes the routes, controllers, middlewares, and HTML bundles for static pages.
 * A router instance must be passed to a {@link Server} to start listening.
 * At least one controller is required for middlewares to work.
 * You can pass a {@link DBClientInterface} instance to connect and disconnect.
 * You can pass your {@link Cors} object.
 * */

export const Server = __Coreum_Server;
export type Server = __Coreum_Server;
