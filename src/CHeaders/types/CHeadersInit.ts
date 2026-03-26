import type { CHeaders } from "@/CHeaders/CHeaders";
import type { CHeaderKey } from "@/CHeaders/types/CHeaderKey";

export type CHeadersInit =
	| Headers
	| CHeaders
	| [string, string][]
	| (Record<string, string> & Partial<Record<CHeaderKey, string>>);
