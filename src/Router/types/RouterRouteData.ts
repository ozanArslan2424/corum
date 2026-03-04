import type { AnyRoute } from "../../Route/types/AnyRoute";

export type RouterRouteData = Pick<
	AnyRoute,
	"id" | "endpoint" | "method" | "pattern" | "handler"
>;
