import type { Status } from "@/internal/enums/Status";
import type { CookiesInit } from "@/internal/modules/Cookies/types/CookiesInit";
import type { HttpHeadersInit } from "@/internal/modules/HttpHeaders/types/HttpHeadersInit";

export type HttpResponseInit = {
	cookies?: CookiesInit;
	headers?: HttpHeadersInit;
	status?: Status;
	statusText?: string;
};
