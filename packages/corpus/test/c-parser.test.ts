import { beforeEach, describe, expect, it } from "bun:test";

import type { Schema } from "corpus-utils/Schema";

import { $registryTesting, TC } from "./_modules";
import { createTestServer } from "./utils/createTestServer";
import { TestModel } from "./utils/TestModel";
import { TestParsingController } from "./utils/TestParsingController";

const RAW = { hello: "1" };
const PARSED = { hello: 1 };
const BAD = { unknown: "object" };

createTestServer();

beforeEach(() => {
	$registryTesting.reset();
	new TestParsingController();
});

const parse = (data: unknown, schema: Schema) =>
	TC.Parser.schemaParser.parse("test", data, schema["~standard"].validate);

describe("Parser unit", () => {
	describe("success", () => {
		it("ark object", async () => {
			expect(parse(PARSED, TestModel.arkObject)).resolves.toEqual(PARSED);
		});
		it("zod object", async () => {
			expect(parse(PARSED, TestModel.zodObject)).resolves.toEqual(PARSED);
		});
		it("ark route — coerces params and search, passes body through", async () => {
			expect(parse(RAW, TestModel.arkRoute.params)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.arkRoute.search)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.arkRoute.body)).resolves.toEqual(PARSED);
		});
		it("zod route — coerces params and search, passes body through", async () => {
			expect(parse(RAW, TestModel.zodRoute.params)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.zodRoute.search)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.zodRoute.body)).resolves.toEqual(PARSED);
		});
		it("ark route (referenced schemas)", async () => {
			expect(parse(RAW, TestModel.arkRouteReferenced.params)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.arkRouteReferenced.search)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.arkRouteReferenced.body)).resolves.toEqual(PARSED);
		});
		it("zod route (referenced schemas)", async () => {
			expect(parse(RAW, TestModel.zodRouteReferenced.params)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.zodRouteReferenced.search)).resolves.toEqual(PARSED);
			expect(parse(PARSED, TestModel.zodRouteReferenced.body)).resolves.toEqual(PARSED);
		});
	});

	describe("failure", () => {
		it("ark object", async () => {
			expect(parse(BAD, TestModel.arkObject)).rejects.toThrow(TC.Exception);
		});
		it("zod object", async () => {
			expect(parse(BAD, TestModel.zodObject)).rejects.toThrow(TC.Exception);
		});
		it("ark route", async () => {
			expect(parse(BAD, TestModel.arkRoute.params)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.arkRoute.search)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.arkRoute.body)).rejects.toThrow(TC.Exception);
		});
		it("zod route", async () => {
			expect(parse(BAD, TestModel.zodRoute.params)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.zodRoute.search)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.zodRoute.body)).rejects.toThrow(TC.Exception);
		});
		it("ark route (referenced schemas)", async () => {
			expect(parse(BAD, TestModel.arkRouteReferenced.params)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.arkRouteReferenced.search)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.arkRouteReferenced.body)).rejects.toThrow(TC.Exception);
		});
		it("zod route (referenced schemas)", async () => {
			expect(parse(BAD, TestModel.zodRouteReferenced.params)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.zodRouteReferenced.search)).rejects.toThrow(TC.Exception);
			expect(parse(BAD, TestModel.zodRouteReferenced.body)).rejects.toThrow(TC.Exception);
		});
	});
});
