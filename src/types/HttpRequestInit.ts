import type { Method } from "@/enums/Method";
import type { HttpHeadersInit } from "@/types/HttpHeadersInit";

export type HttpRequestInit = Omit<RequestInit, "headers" | "method"> & {
	headers?: HttpHeadersInit;
	method?: Method;
};
