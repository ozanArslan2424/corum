import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

import type { Res } from "@/Res/Res";

export type ErrorHandler<R = unknown> = Func<[Error], MaybePromise<Res<R>>>;
