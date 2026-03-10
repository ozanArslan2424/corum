import type { CHeaders } from "@/CHeaders/CHeaders";
import type { HeaderKey } from "@/CHeaders/types/HeaderKey";

export type CHeadersInit =
	| Headers
	| CHeaders
	| [string, string][]
	| (Record<string, string> & Partial<Record<HeaderKey, string>>);
