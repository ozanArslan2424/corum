import type { Status } from "@/internal/enums/Status";
import type { HttpErrorInterface } from "@/internal/modules/HttpError/HttpErrorInterface";

export abstract class HttpErrorAbstract
	extends Error
	implements HttpErrorInterface
{
	constructor(
		public override message: string,
		public status: Status,
		public data?: unknown,
	) {
		super(message);
	}
}
