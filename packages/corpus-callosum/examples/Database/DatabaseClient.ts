import type { ExampleType } from "../Example/ExampleModel";

export class DatabaseClient {
	examples: Map<string, ExampleType["entity"]> = new Map();
}
