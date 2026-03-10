import type { Status } from "@/CResponse/enums/Status";
import type { CookiesInit } from "@/Cookies/types/CookiesInit";
import type { CHeadersInit } from "@/CHeaders/types/CHeadersInit";

export type CResponseInit = {
	cookies?: CookiesInit;
	headers?: CHeadersInit;
	status?: Status;
	statusText?: string;
};
