import type { Method } from "@/CRequest/enums/Method";
import type { CHeadersInit } from "@/CHeaders/types/CHeadersInit";

export type CRequestInit = Omit<RequestInit, "headers" | "method"> & {
	headers?: CHeadersInit;
	method?: Method;
};
