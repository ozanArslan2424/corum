type _Prim = string | number | boolean;

type Prettify<T> = { [K in keyof T]: T[K] } & {};

type ExtractArgs<T> = (Omit<T, "response"> extends infer U
	? { [K in keyof U as U[K] extends undefined ? never : K]: U[K] }
	: never) & {
	headers?: HeadersInit;
	init?: RequestInit;
};

interface RequestDescriptor {
	endpoint: string;
	method: string;
	body?: unknown;
	search?: Record<string, unknown>;
	headers?: HeadersInit;
	init?: Omit<RequestInit, "headers">;
}

namespace Entities {}

namespace Models {
	export type Param1Param2Get = Prettify<{
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: void;
	}>;
	export type HelloParam1Param2Get = Prettify<{
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: void;
	}>;
	export type WorldParam1Param2Get = Prettify<{
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: void;
	}>;
	export type LalalaParam1Param2Get = Prettify<{
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: void;
	}>;
	export type YesyesParam2Get = Prettify<{
		search?: Record<string, unknown>;
		params: { param2: _Prim };
		response: void;
	}>;
	export type OkayParam1LetsgoGet = Prettify<{
		search?: Record<string, unknown>;
		params: { param1: _Prim };
		response: void;
	}>;
	export type DenemeParam1Param2Get = Prettify<{
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: void;
	}>;
	export type WeGotThisGet = Prettify<{
		search?: Record<string, unknown>;
		response: void;
	}>;
	export type OhmyohmyGet = Prettify<{
		search?: Record<string, unknown>;
		response: void;
	}>;
	export type _2brosGet = Prettify<{
		search?: Record<string, unknown>;
		response: void;
	}>;
	export type ChillinInAHottubGet = Prettify<{
		search?: Record<string, unknown>;
		response: void;
	}>;
	export type _5FeetApartCuzTheyreNotGayGet = Prettify<{
		search?: Record<string, unknown>;
		response: void;
	}>;
	export type Verywild_Get = Prettify<{
		search?: Record<string, unknown>;
		params: { "*": _Prim };
		response: void;
	}>;
	export type Craaaazy_Get = Prettify<{
		search?: Record<string, unknown>;
		params: { "*": _Prim };
		response: void;
	}>;
	export type UsersPost = Prettify<
		{
			search?: Record<string, unknown>;
			response: {
				age: number;
				createdAt: string;
				id: string;
				name: string;
				role: "admin" | "editor" | "viewer";
				status: "active" | "banned" | "inactive";
				tags: string[];
				updatedAt: string;
			};
		} & (
			| {
					body: {
						address: {
							city: string;
							country: string;
							zip?: string;
						};
						age: number;
						name: string;
						role: "admin" | "editor" | "viewer";
						tags: string[];
					};
					formData?: never;
			  }
			| {
					body?: never;
					formData: FormData;
			  }
		)
	>;
	export type UsersGet = Prettify<{
		search: {
			limit: string;
			page: string;
			role?: "admin" | "editor" | "viewer";
			status?: "active" | "banned" | "inactive";
		};
		response: void;
	}>;
	export type UsersIdGet = Prettify<{
		search?: Record<string, unknown>;
		params: {
			id: string;
		};
		response: {
			age: number;
			createdAt: string;
			id: string;
			name: string;
			role: "admin" | "editor" | "viewer";
			status: "active" | "banned" | "inactive";
			tags: string[];
			updatedAt: string;
		};
	}>;
	export type UsersIdPut = Prettify<
		{
			search?: Record<string, unknown>;
			params: {
				id: string;
			};
			response: {
				age: number;
				createdAt: string;
				id: string;
				name: string;
				role: "admin" | "editor" | "viewer";
				status: "active" | "banned" | "inactive";
				tags: string[];
				updatedAt: string;
			};
		} & (
			| {
					body: {
						address: {
							city: string;
							country: string;
							zip?: string;
						};
						age: number;
						name: string;
						role: "admin" | "editor" | "viewer";
						tags: string[];
					};
					formData?: never;
			  }
			| {
					body?: never;
					formData: FormData;
			  }
		)
	>;
	export type UsersIdDelete = Prettify<{
		search?: Record<string, unknown>;
		params: {
			id: string;
		};
		response: void;
	}>;
	export type UsersIdPostsPost = Prettify<
		{
			search?: Record<string, unknown>;
			params: {
				id: string;
			};
			response: {
				authorId: string;
				content: string;
				createdAt: string;
				id: string;
				metadata: {
					category: "life" | "other" | "tech";
					likes: number;
					views: number;
				};
				published: boolean;
				title: string;
				updatedAt: string;
			};
		} & (
			| {
					body: {
						content: string;
						metadata: {
							category: "life" | "other" | "tech";
							likes: number;
							views: number;
						};
						published: boolean;
						title: string;
					};
					formData?: never;
			  }
			| {
					body?: never;
					formData: FormData;
			  }
		)
	>;
	export type OrgsPost = Prettify<
		{
			search?: Record<string, unknown>;
			response: void;
		} & (
			| {
					body: {
						name: string;
						owner: {
							role: "admin" | "editor" | "viewer";
							userId: string;
						};
						plan: "enterprise" | "free" | "pro";
						seats: number;
					};
					formData?: never;
			  }
			| {
					body?: never;
					formData: FormData;
			  }
		)
	>;
	export type OrgsOrgIdMembersGet = Prettify<{
		search: {
			limit: string;
			page: string;
		};
		params: {
			orgId: string;
		};
		response: void;
	}>;
	export type OrgsOrgIdMembersMemberIdPut = Prettify<
		{
			search?: Record<string, unknown>;
			params: {
				memberId: string;
				orgId: string;
			};
			response: void;
		} & (
			| {
					body: {
						role: "admin" | "editor" | "viewer";
						status: "active" | "banned" | "inactive";
					};
					formData?: never;
			  }
			| {
					body?: never;
					formData: FormData;
			  }
		)
	>;
	export type OrgsOrgIdMembersMemberIdDelete = Prettify<{
		search?: Record<string, unknown>;
		params: {
			memberId: string;
			orgId: string;
		};
		response: void;
	}>;
}

namespace Args {
	export type Param1Param2Get = ExtractArgs<Models.Param1Param2Get>;
	export type HelloParam1Param2Get = ExtractArgs<Models.HelloParam1Param2Get>;
	export type WorldParam1Param2Get = ExtractArgs<Models.WorldParam1Param2Get>;
	export type LalalaParam1Param2Get = ExtractArgs<Models.LalalaParam1Param2Get>;
	export type YesyesParam2Get = ExtractArgs<Models.YesyesParam2Get>;
	export type OkayParam1LetsgoGet = ExtractArgs<Models.OkayParam1LetsgoGet>;
	export type DenemeParam1Param2Get = ExtractArgs<Models.DenemeParam1Param2Get>;
	export type WeGotThisGet = ExtractArgs<Models.WeGotThisGet>;
	export type OhmyohmyGet = ExtractArgs<Models.OhmyohmyGet>;
	export type _2brosGet = ExtractArgs<Models._2brosGet>;
	export type ChillinInAHottubGet = ExtractArgs<Models.ChillinInAHottubGet>;
	export type _5FeetApartCuzTheyreNotGayGet =
		ExtractArgs<Models._5FeetApartCuzTheyreNotGayGet>;
	export type Verywild_Get = ExtractArgs<Models.Verywild_Get>;
	export type Craaaazy_Get = ExtractArgs<Models.Craaaazy_Get>;
	export type UsersPost = ExtractArgs<Models.UsersPost>;
	export type UsersGet = ExtractArgs<Models.UsersGet>;
	export type UsersIdGet = ExtractArgs<Models.UsersIdGet>;
	export type UsersIdPut = ExtractArgs<Models.UsersIdPut>;
	export type UsersIdDelete = ExtractArgs<Models.UsersIdDelete>;
	export type UsersIdPostsPost = ExtractArgs<Models.UsersIdPostsPost>;
	export type OrgsPost = ExtractArgs<Models.OrgsPost>;
	export type OrgsOrgIdMembersGet = ExtractArgs<Models.OrgsOrgIdMembersGet>;
	export type OrgsOrgIdMembersMemberIdPut =
		ExtractArgs<Models.OrgsOrgIdMembersMemberIdPut>;
	export type OrgsOrgIdMembersMemberIdDelete =
		ExtractArgs<Models.OrgsOrgIdMembersMemberIdDelete>;
}

class CorpusApi {
	constructor(public readonly baseUrl: string) {}

	public fetchFn: <R = unknown>(args: RequestDescriptor) => Promise<R> = async (
		args,
	) => {
		const url = new URL(args.endpoint, this.baseUrl);
		const headers = new Headers(args.headers);
		const method: RequestInit["method"] = args.method;
		let body: RequestInit["body"];
		if (args.search) {
			for (const [key, val] of Object.entries(args.search)) {
				if (val == null) {
					continue;
				}
				url.searchParams.append(
					key,
					typeof val === "object"
						? JSON.stringify(val as object)
						: String(val as _Prim),
				);
			}
		}
		if (args.body) {
			if (!headers.has("Content-Type") || !headers.has("content-type")) {
				if (!(args.body instanceof FormData)) {
					headers.set("Content-Type", "application/json");
				}
			}
			body =
				args.body instanceof FormData ? args.body : JSON.stringify(args.body);
		}
		const req = new Request(url, { method, headers, body, ...args.init });
		const res = await fetch(req);
		const contentType = res.headers.get("content-type");
		if (contentType?.includes("application/json")) return await res.json();
		if (contentType?.includes("text/")) return await res.text();
		return await res.blob();
	};

	public setFetchFn(cb: <R = unknown>(args: RequestDescriptor) => Promise<R>) {
		return (this.fetchFn = cb);
	}

	public readonly endpoints = {
		param1Param2Get: (p: Args.Param1Param2Get["params"]) =>
			`/${String(p.param1)}/${String(p.param2)}`,
		helloParam1Param2Get: (p: Args.HelloParam1Param2Get["params"]) =>
			`/hello/${String(p.param1)}/${String(p.param2)}`,
		worldParam1Param2Get: (p: Args.WorldParam1Param2Get["params"]) =>
			`/world/${String(p.param1)}/${String(p.param2)}`,
		lalalaParam1Param2Get: (p: Args.LalalaParam1Param2Get["params"]) =>
			`/lalala/${String(p.param1)}/${String(p.param2)}`,
		yesyesParam2Get: (p: Args.YesyesParam2Get["params"]) =>
			`/yesyes/${String(p.param2)}`,
		okayParam1LetsgoGet: (p: Args.OkayParam1LetsgoGet["params"]) =>
			`/okay/${String(p.param1)}/letsgo`,
		denemeParam1Param2Get: (p: Args.DenemeParam1Param2Get["params"]) =>
			`/deneme/${String(p.param1)}/${String(p.param2)}`,
		weGotThisGet: "/we/got/this",
		ohmyohmyGet: "/ohmyohmy",
		_2brosGet: "/2bros",
		chillinInAHottubGet: "/chillin/in/a/hottub",
		_5FeetApartCuzTheyreNotGayGet: "/5/feet/apart/cuz/theyre/not/gay",
		verywild_Get: (p: Args.Verywild_Get["params"]) =>
			`/verywild/${String(p["*"])}`,
		craaaazy_Get: (p: Args.Craaaazy_Get["params"]) =>
			`/craaaazy/${String(p["*"])}`,
		usersPost: "/users",
		usersGet: "/users",
		usersIdGet: (p: Args.UsersIdGet["params"]) => `/users/${String(p.id)}`,
		usersIdPut: (p: Args.UsersIdPut["params"]) => `/users/${String(p.id)}`,
		usersIdDelete: (p: Args.UsersIdDelete["params"]) =>
			`/users/${String(p.id)}`,
		usersIdPostsPost: (p: Args.UsersIdPostsPost["params"]) =>
			`/users/${String(p.id)}/posts`,
		orgsPost: "/orgs",
		orgsOrgIdMembersGet: (p: Args.OrgsOrgIdMembersGet["params"]) =>
			`/orgs/${String(p.orgId)}/members`,
		orgsOrgIdMembersMemberIdPut: (
			p: Args.OrgsOrgIdMembersMemberIdPut["params"],
		) => `/orgs/${String(p.orgId)}/members/${String(p.memberId)}`,
		orgsOrgIdMembersMemberIdDelete: (
			p: Args.OrgsOrgIdMembersMemberIdDelete["params"],
		) => `/orgs/${String(p.orgId)}/members/${String(p.memberId)}`,
	};

	public param1Param2Get = (args: Args.Param1Param2Get) => {
		const req = {
			endpoint: `/${String(args.params.param1)}/${String(args.params.param2)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.Param1Param2Get["response"]>(req);
	};

	public helloParam1Param2Get = (args: Args.HelloParam1Param2Get) => {
		const req = {
			endpoint: `/hello/${String(args.params.param1)}/${String(args.params.param2)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.HelloParam1Param2Get["response"]>(req);
	};

	public worldParam1Param2Get = (args: Args.WorldParam1Param2Get) => {
		const req = {
			endpoint: `/world/${String(args.params.param1)}/${String(args.params.param2)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.WorldParam1Param2Get["response"]>(req);
	};

	public lalalaParam1Param2Get = (args: Args.LalalaParam1Param2Get) => {
		const req = {
			endpoint: `/lalala/${String(args.params.param1)}/${String(args.params.param2)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.LalalaParam1Param2Get["response"]>(req);
	};

	public yesyesParam2Get = (args: Args.YesyesParam2Get) => {
		const req = {
			endpoint: `/yesyes/${String(args.params.param2)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.YesyesParam2Get["response"]>(req);
	};

	public okayParam1LetsgoGet = (args: Args.OkayParam1LetsgoGet) => {
		const req = {
			endpoint: `/okay/${String(args.params.param1)}/letsgo`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.OkayParam1LetsgoGet["response"]>(req);
	};

	public denemeParam1Param2Get = (args: Args.DenemeParam1Param2Get) => {
		const req = {
			endpoint: `/deneme/${String(args.params.param1)}/${String(args.params.param2)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.DenemeParam1Param2Get["response"]>(req);
	};

	public weGotThisGet = (args: Args.WeGotThisGet) => {
		const req = {
			endpoint: "/we/got/this",
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.WeGotThisGet["response"]>(req);
	};

	public ohmyohmyGet = (args: Args.OhmyohmyGet) => {
		const req = {
			endpoint: "/ohmyohmy",
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.OhmyohmyGet["response"]>(req);
	};

	public _2brosGet = (args: Args._2brosGet) => {
		const req = {
			endpoint: "/2bros",
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models._2brosGet["response"]>(req);
	};

	public chillinInAHottubGet = (args: Args.ChillinInAHottubGet) => {
		const req = {
			endpoint: "/chillin/in/a/hottub",
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.ChillinInAHottubGet["response"]>(req);
	};

	public _5FeetApartCuzTheyreNotGayGet = (
		args: Args._5FeetApartCuzTheyreNotGayGet,
	) => {
		const req = {
			endpoint: "/5/feet/apart/cuz/theyre/not/gay",
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models._5FeetApartCuzTheyreNotGayGet["response"]>(req);
	};

	public verywild_Get = (args: Args.Verywild_Get) => {
		const req = {
			endpoint: `/verywild/${String(args.params["*"])}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.Verywild_Get["response"]>(req);
	};

	public craaaazy_Get = (args: Args.Craaaazy_Get) => {
		const req = {
			endpoint: `/craaaazy/${String(args.params["*"])}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.Craaaazy_Get["response"]>(req);
	};

	public usersPost = (args: Args.UsersPost) => {
		const req = {
			endpoint: "/users",
			method: "POST",
			search: args.search,
			body: args.body ?? args.formData,
		};
		return this.fetchFn<Models.UsersPost["response"]>(req);
	};

	public usersGet = (args: Args.UsersGet) => {
		const req = {
			endpoint: "/users",
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.UsersGet["response"]>(req);
	};

	public usersIdGet = (args: Args.UsersIdGet) => {
		const req = {
			endpoint: `/users/${String(args.params.id)}`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.UsersIdGet["response"]>(req);
	};

	public usersIdPut = (args: Args.UsersIdPut) => {
		const req = {
			endpoint: `/users/${String(args.params.id)}`,
			method: "PUT",
			search: args.search,
			body: args.body ?? args.formData,
		};
		return this.fetchFn<Models.UsersIdPut["response"]>(req);
	};

	public usersIdDelete = (args: Args.UsersIdDelete) => {
		const req = {
			endpoint: `/users/${String(args.params.id)}`,
			method: "DELETE",
			search: args.search,
		};
		return this.fetchFn<Models.UsersIdDelete["response"]>(req);
	};

	public usersIdPostsPost = (args: Args.UsersIdPostsPost) => {
		const req = {
			endpoint: `/users/${String(args.params.id)}/posts`,
			method: "POST",
			search: args.search,
			body: args.body ?? args.formData,
		};
		return this.fetchFn<Models.UsersIdPostsPost["response"]>(req);
	};

	public orgsPost = (args: Args.OrgsPost) => {
		const req = {
			endpoint: "/orgs",
			method: "POST",
			search: args.search,
			body: args.body ?? args.formData,
		};
		return this.fetchFn<Models.OrgsPost["response"]>(req);
	};

	public orgsOrgIdMembersGet = (args: Args.OrgsOrgIdMembersGet) => {
		const req = {
			endpoint: `/orgs/${String(args.params.orgId)}/members`,
			method: "GET",
			search: args.search,
		};
		return this.fetchFn<Models.OrgsOrgIdMembersGet["response"]>(req);
	};

	public orgsOrgIdMembersMemberIdPut = (
		args: Args.OrgsOrgIdMembersMemberIdPut,
	) => {
		const req = {
			endpoint: `/orgs/${String(args.params.orgId)}/members/${String(args.params.memberId)}`,
			method: "PUT",
			search: args.search,
			body: args.body ?? args.formData,
		};
		return this.fetchFn<Models.OrgsOrgIdMembersMemberIdPut["response"]>(req);
	};

	public orgsOrgIdMembersMemberIdDelete = (
		args: Args.OrgsOrgIdMembersMemberIdDelete,
	) => {
		const req = {
			endpoint: `/orgs/${String(args.params.orgId)}/members/${String(args.params.memberId)}`,
			method: "DELETE",
			search: args.search,
		};
		return this.fetchFn<Models.OrgsOrgIdMembersMemberIdDelete["response"]>(req);
	};
}

export type { RequestDescriptor, Entities, Models, Args };

export { CorpusApi };
