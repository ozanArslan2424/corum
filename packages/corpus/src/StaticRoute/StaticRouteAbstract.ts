import { Method } from "@/CRequest/Method";
import { CResponse } from "@/CResponse/CResponse";
import { CError } from "@/CError/CError";
import { RouteVariant } from "@/Route/RouteVariant";
import { RouteAbstract } from "@/Route/RouteAbstract";
import { XFile } from "@/XFile/XFile";
import { Status } from "@/CResponse/Status";
import { CommonHeaders } from "@/CHeaders/CommonHeaders";
import type { Context } from "@/Context/Context";
import type { StaticRouteDefinition } from "@/StaticRoute/StaticRouteDefinition";
import type { StaticRouteCallback } from "@/StaticRoute/StaticRouteCallback";
import type { Func } from "corpus-utils/Func";
import type { MaybePromise } from "corpus-utils/MaybePromise";

type R = CResponse | string;

export abstract class StaticRouteAbstract<
	B = unknown,
	S = unknown,
	P = unknown,
	E extends string = string,
> extends RouteAbstract<B, S, P, R, E> {
	// FROM CONSTRUCTOR
	abstract readonly path: E;

	abstract readonly definition: StaticRouteDefinition;

	abstract readonly callback?: StaticRouteCallback<B, S, P>;

	// PROTECTED

	protected onFileNotFound: Func<[], Promise<CResponse | never>> = () => {
		throw new CError(Status.NOT_FOUND.toString(), Status.NOT_FOUND);
	};

	protected get filePath(): string {
		return typeof this.definition === "string"
			? this.definition
			: this.definition.filePath;
	}

	// ROUTE BASE PROPERTIES
	readonly variant: RouteVariant = RouteVariant.static;

	get endpoint(): E {
		return this.path;
	}

	get method(): Method {
		return Method.GET;
	}

	get handler(): Func<[Context<B, S, P, R>], MaybePromise<R>> {
		const customHandler = this.callback;

		if (customHandler !== undefined) {
			return async (c) => {
				const file = new XFile(this.filePath);
				const exists = await file.exists();
				if (!exists) {
					return await this.onFileNotFound();
				}
				const content = await file.text();
				c.res.headers.setMany({
					[CommonHeaders.ContentType]: file.mimeType,
					[CommonHeaders.ContentLength]: content.length.toString(),
				});
				return customHandler(c, content);
			};
		}

		if (typeof this.definition === "string") {
			return async () => await CResponse.file(this.filePath);
		}

		return async () => await CResponse.streamFile(this.filePath);
	}
}
