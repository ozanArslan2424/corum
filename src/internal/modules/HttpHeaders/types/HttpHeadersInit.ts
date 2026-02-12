import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpHeaderKey } from "@/internal/modules/HttpHeaders/types/HttpHeaderKey";

export type HttpHeadersInit =
	| Headers
	| HttpHeadersInterface
	| [string, string][]
	| (Record<string, string> & Partial<Record<HttpHeaderKey, string>>);
