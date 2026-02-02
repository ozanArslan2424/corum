import type { __Coreum_Response } from "@/lib/Response/__Coreum_Response";

/**
 * This is NOT the default response. It provides {@link Response.response}
 * getter to access web Response with all mutations applied during the
 * handling of the request, JSON body will be handled and cookies will be
 * applied to response headers.
 * */

export const Response = __Coreum_Response;
export type Response<R = unknown> = __Coreum_Response<R>;
