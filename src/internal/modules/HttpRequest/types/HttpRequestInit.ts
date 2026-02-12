import type { Method } from "@/internal/enums/Method";

import type { HttpHeadersInit } from "@/internal/modules/HttpHeaders/types/HttpHeadersInit";

export type HttpRequestInit = Omit<RequestInit, "headers" | "method"> & {
	headers?: HttpHeadersInit;
	method?: Method;
};
