import type { CommonHeaders } from "@/internal/enums/CommonHeaders";

export type HttpHeaderKey = CommonHeaders | (string & {});
