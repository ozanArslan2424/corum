import type { __Coreum_Status } from "../Status/__Coreum_Status";

export class __Coreum_Error extends Error {
	constructor(
		public override message: string,
		public status: __Coreum_Status,
		public data?: unknown,
	) {
		super(message);
	}
}
