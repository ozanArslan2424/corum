# X Modules

The X modules provide optional utilities and extensions for common web application concerns. These are not core framework features but solve frequent problems with sensible defaults and minimal configuration.

<section class="table-of-contents">

##### Contents

1. [X.Cors](#xcors)
2. [X.RateLimiter](#xratelimiter)
3. [X.File](#xfile)
4. [X.Repository](#xrepository)
5. [X.InferModel](#xinfermodel)

</section>

## X.Cors

<section>

Simple CORS header management. Automatically registers as outbound global middleware.
Provides a preflight handler for `OPTIONS` requests. See [XCors](/docs/xcors) for full configuration.

```ts
import { X } from "@ozanarslan/corpus";

new X.Cors({
	allowedOrigins: ["https://app.example.com"],
	allowedMethods: ["GET", "POST"],
	credentials: true,
});
```

</section>

## X.RateLimiter

<section>

Intelligent rate limiting with tiered identification and multiple storage backends.

```ts
import { X } from "@ozanarslan/corpus";

// Default: memory store, 120/60/20 requests per minute
new X.RateLimiter();
```

Automatically classifies requests by trust level: authenticated users (JWT), IP addresses, or browser fingerprints. See [XRateLimiter](/docs/xratelimiter) for details.

</section>

## X.File

<section>

File system abstraction with MIME type detection.

```ts
import { C, X } from "@ozanarslan/corpus";

const file = new X.File("assets/report.pdf");

if (await file.exists()) {
	console.log(file.mimeType); // "application/pdf"
	return C.Response.file(file.path);
}
```

See [XFile](/docs/xfile) for streaming and full API.

</section>

## X.Repository

<section>

Abstract base class for database repositories.

```ts
import { X } from "@ozanarslan/corpus";

class UserRepository extends X.Repository {
	async findById(id: number) {
		return this.db.query("SELECT * FROM users WHERE id = ?", [id]);
	}
}
```

Extend `DatabaseClientInterface` via module augmentation for type safety. See [XRepository](/docs/xrepository).

</section>

## X.InferModel

<section>

Helper type for inferring all schemas from a single object containing multiple RouteModels. Useful when you prefer to colocate all your route schemas in one place.

```ts
import { C, X } from "@ozanarslan/corpus";

class UserModel {
	static entity = z.object({
		id: z.number(),
		name: z.string(),
	});

	static create = {
		body: z.object({ name: z.string() }),
		response: this.entity,
	};
}

type M = X.InferModel<typeof UserModel>;
// M["create"] = { body: { name: string }, response: { id: number, name: string } }
```

See [Model](/docs/model) for more on route validation and type inference.

</section>
```
