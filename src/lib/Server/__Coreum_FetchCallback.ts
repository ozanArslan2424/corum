import type { __Coreum_Request } from "../Request/__Coreum_Request";
import type { __Coreum_Response } from "../Response/__Coreum_Response";

export type __Coreum_FetchCallback = (req: __Coreum_Request) => Promise<__Coreum_Response>;
