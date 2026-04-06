import { C } from "@ozanarslan/corpus";
import { ExampleModel } from "./ExampleModel";
import type { ExampleService } from "./ExampleService";

export class ExampleController extends C.Controller {
	constructor(private readonly service: ExampleService) {
		super({ prefix: "/example" });
	}

	get = this.route("/:id", (c) => this.service.get(c.params), ExampleModel.get);

	list = this.route("/", (c) => this.service.list(c.search), ExampleModel.list);

	create = this.route(
		{ method: "POST", path: "/" },
		(c) => this.service.create(c.body),
		ExampleModel.create,
	);

	update = this.route(
		{ method: "PUT", path: "/:id" },
		(c) => this.service.update(c.params, c.body),
		ExampleModel.update,
	);

	delete = this.route(
		{ method: "DELETE", path: "/:id" },
		(c) => this.service.delete(c.params),
		ExampleModel.delete,
	);
}
