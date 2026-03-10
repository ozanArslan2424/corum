import { Status } from "@/CResponse/enums/Status";
import { CResponse } from "@/CResponse/CResponse";

export class CError extends Error {
	constructor(
		public override message: string,
		public status: Status,
		public data?: unknown,
	) {
		super(message);
	}

	toResponse(): CResponse {
		return new CResponse(
			this.data
				? { error: this.data, message: this.message }
				: { error: true, message: this.message },
			{ status: this.status },
		);
	}

	isStatusOf(status: Status): boolean {
		return this.status === status;
	}

	static internalServerError(msg?: string): CError {
		const status = Status.INTERNAL_SERVER_ERROR;
		return new this(msg ?? status.toString(), status);
	}

	static badRequest(msg?: string): CError {
		const status = Status.BAD_REQUEST;
		return new this(msg ?? status.toString(), status);
	}

	static notFound(msg?: string): CError {
		const status = Status.NOT_FOUND;
		return new this(msg ?? status.toString(), status);
	}

	static methodNotAllowed(msg?: string): CError {
		const status = Status.METHOD_NOT_ALLOWED;
		return new this(msg ?? status.toString(), status);
	}

	static unprocessableEntity(msg?: string): CError {
		const status = Status.UNPROCESSABLE_ENTITY;
		return new this(msg ?? status.toString(), status);
	}
}
