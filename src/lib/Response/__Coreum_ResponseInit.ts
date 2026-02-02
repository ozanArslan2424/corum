import type { __Coreum_Cookies } from "../Cookies/__Coreum_Cookies";
import type { __Coreum_Status } from "../Status/__Coreum_Status";
import type { __Coreum_Headers } from "../Headers/__Coreum_Headers";

export type __Coreum_ResponseInit = {
	cookies?: __Coreum_Cookies;
	headers?: HeadersInit | __Coreum_Headers;
	status?: __Coreum_Status;
	statusText?: string;
};
