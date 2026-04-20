import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { Req } from "@/Req/Req";
import type { Res } from "@/Res/Res";

export type RequestHandler<R = unknown> = Func<[Req], MaybePromise<Res<R>>>;
