import { type } from "arktype";
import { X } from "@ozanarslan/corpus";

export type ExampleType = X.InferModel<typeof ExampleModel>;

export class ExampleModel {
	static entity = type({ id: "string", name: "string" });
	static get = { params: type({ id: "string" }), response: this.entity };
	static list = {
		search: type({
			"page?": type("string").pipe(Number),
			"limit?": type("string").pipe(Number),
		}),
		response: this.entity.array(),
	};
	static create = { body: type({ name: "string > 3" }), response: this.entity };
	static update = {
		params: this.get.params,
		body: this.create.body.partial(),
		response: this.entity,
	};
	static delete = { params: this.get.params, response: type("undefined") };
}
