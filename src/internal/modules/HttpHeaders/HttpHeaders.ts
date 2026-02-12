import { HttpHeadersAbstract } from "@/internal/modules/HttpHeaders/HttpHeadersAbstract";
import type { HttpHeadersInterface } from "@/internal/modules/HttpHeaders/HttpHeadersInterface";
import type { HttpHeaderKey } from "@/internal/modules/HttpHeaders/types/HttpHeaderKey";
import type { HttpHeadersInit } from "@/internal/modules/HttpHeaders/types/HttpHeadersInit";

/** Headers is extended to include helpers and intellisense for common header names. */

export class HttpHeaders
	extends HttpHeadersAbstract
	implements HttpHeadersInterface
{
	static findHeaderInInit(
		init: HttpHeadersInit,
		name: HttpHeaderKey,
	): string | null {
		if (init instanceof HttpHeaders || init instanceof Headers) {
			return init.get(name);
		} else if (Array.isArray(init)) {
			return init.find((entry) => entry[0] === name)?.[1] ?? null;
		} else {
			return init[name] ?? null;
		}
	}
}
