import type { CHeadersInit } from "@/CHeaders/CHeadersInit";
import type { CookiesInit } from "@/Cookies/CookiesInit";
import type { Status } from "@/Status/Status";

export type ResInit = {
	cookies?: CookiesInit;
	headers?: CHeadersInit;
	status?: Status;
	statusText?: string;
};
