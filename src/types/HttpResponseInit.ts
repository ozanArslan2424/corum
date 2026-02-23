import type { Status } from "@/enums/Status";
import type { CookiesInit } from "@/types/CookiesInit";
import type { HttpHeadersInit } from "@/types/HttpHeadersInit";

export type HttpResponseInit = {
	cookies?: CookiesInit;
	headers?: HttpHeadersInit;
	status?: Status;
	statusText?: string;
};
