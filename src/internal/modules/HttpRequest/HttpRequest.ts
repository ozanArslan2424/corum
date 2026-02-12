import type { HttpRequestInterface } from "@/internal/modules/HttpRequest/HttpRequestInterface";

import { HttpRequestAbstract } from "@/internal/modules/HttpRequest/HttpRequestAbstract";

/** HttpRequest includes a cookie jar, better headers, and some utilities. */

export class HttpRequest
	extends HttpRequestAbstract
	implements HttpRequestInterface {}
