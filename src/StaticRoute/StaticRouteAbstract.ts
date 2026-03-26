import { CError } from "@/CError/CError";
import { CommonHeaders } from "@/CHeaders/enums/CommonHeaders";
import { CResponse } from "@/CResponse/CResponse";
import { Status } from "@/CResponse/enums/Status";
import { RouteVariant } from "@/Route/enums/RouteVariant";
import { RouteAbstract } from "@/Route/RouteAbstract";
import type { RouteHandler } from "@/Route/types/RouteHandler";
import type { StaticRouteDefinition } from "@/StaticRoute/types/StaticRouteDefinition";
import type { StaticRouteHandler } from "@/StaticRoute/types/StaticRouteHandler";
import { XFile } from "@/XFile/XFile";

type R = string | CResponse;

export abstract class StaticRouteAbstract<
	Path extends string = string,
	B = unknown,
	S = unknown,
	P = unknown,
> extends RouteAbstract<Path, B, S, P, R> {
	variant: RouteVariant = RouteVariant.static;
	protected abstract filePath: string;

	protected resolveFilePath(definition: StaticRouteDefinition): string {
		return typeof definition === "string" ? definition : definition.filePath;
	}

	protected resolveHandler(
		definition: StaticRouteDefinition,
		customHandler?: StaticRouteHandler<B, S, P>,
	): RouteHandler<B, S, P, R> {
		if (customHandler !== undefined) {
			return async (c) => {
				const file = new XFile(this.filePath);
				const exists = await file.exists();
				if (!exists) {
					throw new CError(Status.NOT_FOUND.toString(), Status.NOT_FOUND);
				}
				const content = await file.text();
				c.res.headers.setMany({
					[CommonHeaders.ContentType]: file.mimeType,
					[CommonHeaders.ContentLength]: content.length.toString(),
				});
				return customHandler(c, content);
			};
		} else if (typeof definition === "string") {
			return async () => await CResponse.file(this.filePath);
		} else {
			return async () => await CResponse.streamFile(this.filePath);
		}
	}
}
