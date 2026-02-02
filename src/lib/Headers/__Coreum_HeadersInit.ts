import type { __Coreum_HeaderKey } from "./__Coreum_HeaderKey";

export type __Coreum_HeadersInit =
	| (Record<string, string> & {
			[K in __Coreum_HeaderKey]?: string;
	  })
	| [string, string][]
	| Headers;
