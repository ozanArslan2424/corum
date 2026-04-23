import { EntityStore } from "@/EntityStore/EntityStore";
import type { EntityStoreInterface } from "@/EntityStore/EntityStoreInterface";
import { MiddlewareRouter } from "@/MiddlewareRouter/MiddlewareRouter";
import type { MiddlewareRouterInterface } from "@/MiddlewareRouter/MiddlewareRouterInterface";
import { BodyParser } from "@/Parser/BodyParser";
import type { BodyParserInterface } from "@/Parser/BodyParserInterface";
import { FormDataParser } from "@/Parser/FormDataParser";
import type { ObjectParserInterface } from "@/Parser/ObjectParserInterface";
import { SchemaParser } from "@/Parser/SchemaParser";
import type { SchemaParserInterface } from "@/Parser/SchemaParserInterface";
import { SearchParamsParser } from "@/Parser/SearchParamsParser";
import { URLParamsParser } from "@/Parser/URLParamsParser";
import type { RegistryDocEntry } from "@/Registry/RegistryDocEntry";
import type { RegistryInterface } from "@/Registry/RegistryInterface";
import { Router } from "@/Router/Router";
import type { RouterInterface } from "@/Router/RouterInterface";
import { BranchAdapter } from "@/RouterAdapter/BranchAdapter";
import type { RouterAdapterInterface } from "@/RouterAdapter/RouterAdapterInterface";
import type { XCorsInterface } from "@/XCors/XCorsInterface";

export class Registry implements RegistryInterface {
	public adapter!: RouterAdapterInterface;
	public router!: RouterInterface;
	public cors!: XCorsInterface | null;
	public prefix!: string;
	public middlewares!: MiddlewareRouterInterface;
	public urlParamsParser!: ObjectParserInterface<Record<string, string>>;
	public searchParamsParser!: ObjectParserInterface<URLSearchParams>;
	public formDataParser!: ObjectParserInterface<FormData>;
	public bodyParser!: BodyParserInterface;
	public schemaParser!: SchemaParserInterface;

	public readonly docs: Map<string, RegistryDocEntry>;
	public readonly entities: EntityStoreInterface;

	constructor() {
		this.docs = new Map();
		this.entities = new EntityStore();
		this.reset();
	}

	reset(): void {
		this.adapter = new BranchAdapter();
		this.router = new Router(this.adapter);
		this.cors = null;
		this.prefix = "";
		this.middlewares = new MiddlewareRouter();
		this.urlParamsParser = new URLParamsParser();
		this.searchParamsParser = new SearchParamsParser();
		this.formDataParser = new FormDataParser();
		this.bodyParser = new BodyParser(this.formDataParser, this.searchParamsParser);
		this.schemaParser = new SchemaParser();
	}
}
