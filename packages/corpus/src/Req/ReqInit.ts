import type { CHeadersInit } from "@/CHeaders/CHeadersInit";
import type { Method } from "@/Method/Method";

export type ReqInit = Omit<RequestInit, "headers" | "method"> & {
	headers?: CHeadersInit;
	method?: Method;
};
