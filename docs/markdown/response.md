# CResponse

The `CResponse` class represents an HTTP response with automatic body serialization, cookie handling, and header management. It provides static helpers for common response patterns like redirects, file streaming, and Server-Sent Events.

<section class="table-of-contents">

##### Contents

1. [Usage](#usage)
2. [Constructor Parameters](#constructor-parameters)
3. [Properties](#properties)
4. [Static Methods](#static-methods)
5. [Body Serialization](#body-serialization)
6. [Status Enum](#status-enum)

</section>

## Usage

<section>

### Basic response

```ts
import { C } from "@ozanarslan/corpus";

new C.Route("/hello", () => {
	return new C.Response("Hello World");
});
```

### With status and headers

```ts
new C.Route("/created", () => {
	return new C.Response(
		{ id: 1 },
		{
			status: C.Status.CREATED,
			headers: { [C.CommonHeaders.Location]: "/items/1" },
		},
	);
});
```

### Setting cookies

The following is the recommended pattern because CResponse init can also receive another CResponse instance and typescript doesn't do a great job differentiating an object with a class.

```ts
new C.Route("/login", (c) => {
	c.res.cookies.set({
		name: "session",
		value: "abc123",
		httpOnly: true,
		secure: true,
	});

	return { success: true };
});
```

### Accessing the native response

```ts
const cres = new C.Response("data");
cres.response; // Returns native Web API Response
```

</section>

## Constructor Parameters

<section>

### data (optional)

`CResponseBody<R>`

The response body. Automatically serialized based on type. See [Body Serialization](#body-serialization).

</section>

<section>

### init (optional)

`CResponseInit | CResponse`

Response options or another CResponse to copy from.

```ts
type CResponseInit = {
	cookies?: CookiesInit;
	headers?: CHeadersInit;
	status?: Status;
	statusText?: string;
};
```

</section>

## Properties

<section>

| Property   | Type       | Description                              |
| ---------- | ---------- | ---------------------------------------- |
| body       | `BodyInit` | Resolved and serialized body             |
| headers    | `CHeaders` | Response headers                         |
| status     | `Status`   | HTTP status code                         |
| statusText | `string`   | HTTP status text                         |
| cookies    | `Cookies`  | Response cookies                         |
| response   | `Response` | Getter returning native Web API Response |

</section>

## Static Methods

<section>

### redirect

`static redirect(url: string | URL, init?: CResponseInit): CResponse`

Creates a redirect response. Defaults to 302 Found.

```ts
return C.Response.redirect("/new-path");
return C.Response.redirect("/new-path", {
	status: C.Status.MOVED_PERMANENTLY,
});
```

</section>

<section>

### permanentRedirect

`static permanentRedirect(url: string | URL, init?: Omit<CResponseInit, "status">): CResponse`

301 Moved Permanently redirect.

</section>

<section>

### temporaryRedirect

`static temporaryRedirect(url: string | URL, init?: Omit<CResponseInit, "status">): CResponse`

307 Temporary Redirect.

</section>

<section>

### seeOther

`static seeOther(url: string | URL, init?: Omit<CResponseInit, "status">): CResponse`

303 See Other (redirect with GET).

</section>

<section>

### sse

`static sse(source: SseSource, init?: Omit<CResponseInit, "status">, retry?: number): CResponse`

Server-Sent Events stream.

```ts
return C.Response.sse((send) => {
	const interval = setInterval(() => {
		send({ data: { time: Date.now() }, event: "tick" });
	}, 1000);

	return () => clearInterval(interval); // cleanup
});
```

</section>

<section>

### ndjson

`static ndjson(source: NdjsonSource, init?: Omit<CResponseInit, "status">): CResponse`

Newline-delimited JSON stream.

```ts
return C.Response.ndjson((send) => {
	for (const item of largeDataset) {
		send(item);
	}
});
```

</section>

<section>

### streamFile

`static async streamFile(filePath: string, disposition?: "attachment" | "inline", init?: Omit<CResponseInit, "status">): Promise<CResponse<ReadableStream>>`

Stream a file from disk. Uses `Content-Type` from file extension. Defaults to `attachment` disposition.

```ts
return await C.Response.streamFile("assets/video.mp4", "inline");
```

Throws [CError](/docs/error) with 404 if file not found.

</section>

<section>

### file

`static async file(filePath: string, init?: CResponseInit): Promise<CResponse<string>>`

Read entire file into memory as string. Sets `Content-Length` header.

```ts
return await C.Response.file("assets/doc.txt");
```

Throws [CError](/docs/error) with 404 if file not found.

</section>

## Body Serialization

<section>

The body is automatically serialized based on its type:

| Type                                                 | Serialization                        | Content-Type                              |
| ---------------------------------------------------- | ------------------------------------ | ----------------------------------------- |
| `null` / `undefined`                                 | Empty string                         | `text/plain`                              |
| Primitives (`string`, `number`, `boolean`, `bigint`) | `String(data)`                       | `text/plain`                              |
| `Date`                                               | `toISOString()`                      | `text/plain`                              |
| Plain objects / arrays                               | `JSON.stringify()`                   | `application/json`                        |
| `ArrayBuffer`                                        | As-is                                | `application/octet-stream`                |
| `Blob`                                               | As-is                                | Blob's type or `application/octet-stream` |
| `FormData`                                           | As-is                                | `multipart/form-data`                     |
| `URLSearchParams`                                    | As-is                                | `application/x-www-form-urlencoded`       |
| `ReadableStream`                                     | As-is                                | Set manually via headers                  |
| Custom class instances                               | `String(data)` (calls `.toString()`) | `text/plain`                              |

</section>

## Status Enum

Commonly used HTTP status codes.

```ts
type Status = OrNumber<ValueOf<typeof Status>>;

const Status = {
	/** --- 1xx Informational --- */
	/** Continue: Request received, please continue */
	CONTINUE: 100,
	/** Switching Protocols: Protocol change request approved */
	SWITCHING_PROTOCOLS: 101,
	/** Processing (WebDAV) */
	PROCESSING: 102,
	/** Early Hints */
	EARLY_HINTS: 103,

	/** --- 2xx Success --- */
	/** OK: Request succeeded */
	OK: 200,
	/** Created: Resource created */
	CREATED: 201,
	/** Accepted: Request accepted but not completed */
	ACCEPTED: 202,
	/** Non-Authoritative Information */
	NON_AUTHORITATIVE_INFORMATION: 203,
	/** No Content: Request succeeded, no body returned */
	NO_CONTENT: 204,
	/** Reset Content: Clear form or view */
	RESET_CONTENT: 205,
	/** Partial Content: Partial GET successful (e.g. range requests) */
	PARTIAL_CONTENT: 206,
	/** Multi-Status (WebDAV) */
	MULTI_STATUS: 207,
	/** Already Reported (WebDAV) */
	ALREADY_REPORTED: 208,
	/** IM Used (HTTP Delta encoding) */
	IM_USED: 226,

	/** --- 3xx Redirection --- */
	/** Multiple Choices */
	MULTIPLE_CHOICES: 300,
	/** Moved Permanently: Resource moved to a new URL */
	MOVED_PERMANENTLY: 301,
	/** Found: Resource temporarily under different URI */
	FOUND: 302,
	/** See Other: Redirect to another URI using GET */
	SEE_OTHER: 303,
	/** Not Modified: Cached version is still valid */
	NOT_MODIFIED: 304,
	/** Use Proxy: Deprecated */
	USE_PROXY: 305,
	/** Temporary Redirect: Resource temporarily at another URI */
	TEMPORARY_REDIRECT: 307,
	/** Permanent Redirect: Resource permanently at another URI */
	PERMANENT_REDIRECT: 308,

	/** --- 4xx Client Errors --- */
	/** Bad Request: Malformed request */
	BAD_REQUEST: 400,
	/** Unauthorized: Missing or invalid auth credentials */
	UNAUTHORIZED: 401,
	/** Payment Required: Reserved for future use */
	PAYMENT_REQUIRED: 402,
	/** Forbidden: Authenticated but no permission */
	FORBIDDEN: 403,
	/** Not Found: Resource does not exist */
	NOT_FOUND: 404,
	/** Method Not Allowed: HTTP method not allowed */
	METHOD_NOT_ALLOWED: 405,
	/** Not Acceptable: Response not acceptable by client */
	NOT_ACCEPTABLE: 406,
	/** Proxy Authentication Required */
	PROXY_AUTHENTICATION_REQUIRED: 407,
	/** Request Timeout: Server timeout waiting for client */
	REQUEST_TIMEOUT: 408,
	/** Conflict: Request conflict (e.g. duplicate resource) */
	CONFLICT: 409,
	/** Gone: Resource is no longer available */
	GONE: 410,
	/** Length Required: Missing Content-Length header */
	LENGTH_REQUIRED: 411,
	/** Precondition Failed */
	PRECONDITION_FAILED: 412,
	/** Payload Too Large */
	PAYLOAD_TOO_LARGE: 413,
	/** URI Too Long */
	URI_TOO_LONG: 414,
	/** Unsupported Media Type */
	UNSUPPORTED_MEDIA_TYPE: 415,
	/** Range Not Satisfiable */
	RANGE_NOT_SATISFIABLE: 416,
	/** Expectation Failed */
	EXPECTATION_FAILED: 417,
	/** I'm a teapot: Joke response for coffee machines */
	IM_A_TEAPOT: 418,
	/** Misdirected Request: Sent to the wrong server */
	MISDIRECTED_REQUEST: 421,
	/** Unprocessable Entity (WebDAV) */
	UNPROCESSABLE_ENTITY: 422,
	/** Locked (WebDAV) */
	LOCKED: 423,
	/** Failed Dependency (WebDAV) */
	FAILED_DEPENDENCY: 424,
	/** Too Early: Request might be replayed */
	TOO_EARLY: 425,
	/** Upgrade Required */
	UPGRADE_REQUIRED: 426,
	/** Precondition Required */
	PRECONDITION_REQUIRED: 428,
	/** Too Many Requests: Rate limiting */
	TOO_MANY_REQUESTS: 429,
	/** Request Header Fields Too Large */
	REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
	/** Unavailable For Legal Reasons */
	UNAVAILABLE_FOR_LEGAL_REASONS: 451,

	/** --- 5xx Server Errors --- */
	/** Internal Server Error: Unhandled server error */
	INTERNAL_SERVER_ERROR: 500,
	/** Not Implemented: Endpoint/method not implemented */
	NOT_IMPLEMENTED: 501,
	/** Bad Gateway: Invalid response from upstream server */
	BAD_GATEWAY: 502,
	/** Service Unavailable: Server temporarily overloaded/down */
	SERVICE_UNAVAILABLE: 503,
	/** Gateway Timeout: No response from upstream server */
	GATEWAY_TIMEOUT: 504,
	/** HTTP Version Not Supported */
	HTTP_VERSION_NOT_SUPPORTED: 505,
	/** Variant Also Negotiates */
	VARIANT_ALSO_NEGOTIATES: 506,
	/** Insufficient Storage (WebDAV) */
	INSUFFICIENT_STORAGE: 507,
	/** Loop Detected (WebDAV) */
	LOOP_DETECTED: 508,
	/** Not Extended */
	NOT_EXTENDED: 510,
	/** Network Authentication Required */
	NETWORK_AUTHENTICATION_REQUIRED: 511,
} as const;
```
