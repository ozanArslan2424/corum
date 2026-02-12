import type { Status } from "@/internal/enums/Status";

export interface HttpErrorInterface extends Error {
	message: string;
	status: Status;
	data?: unknown;
}
