import type { HttpHeaders } from "@/modules/HttpHeaders";
import type { HttpHeaderKey } from "@/types/HttpHeaderKey";

export type HttpHeadersInit =
	| Headers
	| HttpHeaders
	| [string, string][]
	| (Record<string, string> & Partial<Record<HttpHeaderKey, string>>);
