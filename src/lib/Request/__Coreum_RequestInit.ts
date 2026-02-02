import type { __Coreum_Method } from "../Method/__Coreum_Method";
import type { __Coreum_HeadersInit } from "../Headers/__Coreum_HeadersInit";

export type __Coreum_RequestInit = Omit<RequestInit, "headers" | "method"> & {
	headers?: __Coreum_HeadersInit;
	method: __Coreum_Method;
};
