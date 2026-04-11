import { C } from "@ozanarslan/corpus";

type _Prim = string | number | boolean;

type ExtractArgs<T> = (Omit<T, "response"> extends infer U
	? { [K in keyof U as U[K] extends undefined ? never : K]: U[K] }
	: never) & { headers?: HeadersInit; init?: RequestInit };

interface ReqArgs {
	endpoint: string;
	method: string;
	body?: unknown;
	search?: Record<string, unknown>;
	headers?: HeadersInit;
	init?: RequestInit;
}

namespace Models {
	export interface Param1Param2Get {
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: unknown;
	}

	export interface HelloParam1Param2Get {
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: unknown;
	}

	export interface WorldParam1Param2Get {
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: unknown;
	}

	export interface LalalaParam1Param2Get {
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: unknown;
	}

	export interface YesyesParam2Get {
		search?: Record<string, unknown>;
		params: { param2: _Prim };
		response: unknown;
	}

	export interface OkayParam1LetsgoGet {
		search?: Record<string, unknown>;
		params: { param1: _Prim };
		response: unknown;
	}

	export interface DenemeParam1Param2Get {
		search?: Record<string, unknown>;
		params: { param1: _Prim; param2: _Prim };
		response: unknown;
	}

	export interface WeGotThisGet {
		search?: Record<string, unknown>;
		response: unknown;
	}

	export interface OhmyohmyGet {
		search?: Record<string, unknown>;
		response: unknown;
	}

	export interface _2brosGet {
		search?: Record<string, unknown>;
		response: unknown;
	}

	export interface ChillinInAHottubGet {
		search?: Record<string, unknown>;
		response: unknown;
	}

	export interface _5FeetApartCuzTheyreNotGayGet {
		search?: Record<string, unknown>;
		response: unknown;
	}

	export interface Verywild_Get {
		search?: Record<string, unknown>;
		params: { "*": _Prim };
		response: unknown;
	}

	export interface Craaaazy_Get {
		search?: Record<string, unknown>;
		params: { "*": _Prim };
		response: unknown;
	}

	export interface UsersPost {
		body: {
			address: { city: string; country: string; zip?: string };
			age: number;
			name: string;
			role: "admin" | "editor" | "viewer";
			tags: string[];
		};
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
	}

	export interface UsersGet {
		search: {
			limit: unknown;
			page: unknown;
			role?: "admin" | "editor" | "viewer";
			status?: "active" | "banned" | "inactive";
		};
		response: unknown;
	}

	export interface UsersIdGet {
		search?: Record<string, unknown>;
		params: { id: string };
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
	}

	export interface UsersIdPut {
		body: {
			address: { city: string; country: string; zip?: string };
			age: number;
			name: string;
			role: "admin" | "editor" | "viewer";
			tags: string[];
		};
		search?: Record<string, unknown>;
		params: { id: string };
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
	}

	export interface UsersIdDelete {
		search?: Record<string, unknown>;
		params: { id: string };
		response: unknown;
	}

	export interface UsersIdPostsPost {
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
		search?: Record<string, unknown>;
		params: { id: string };
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
	}

	export interface OrgsPost {
		body: {
			name: string;
			owner: { role: "admin" | "editor" | "viewer"; userId: string };
			plan: "enterprise" | "free" | "pro";
			seats: number;
		};
		search?: Record<string, unknown>;
		response: unknown;
	}

	export interface OrgsOrgIdMembersGet {
		search: { limit: unknown; page: unknown };
		params: { orgId: string };
		response: unknown;
	}

	export interface OrgsOrgIdMembersMemberIdPut {
		body: {
			role: "admin" | "editor" | "viewer";
			status: "active" | "banned" | "inactive";
		};
		search?: Record<string, unknown>;
		params: { memberId: string; orgId: string };
		response: unknown;
	}

	export interface OrgsOrgIdMembersMemberIdDelete {
		search?: Record<string, unknown>;
		params: { memberId: string; orgId: string };
		response: unknown;
	}
}

const makeParam1Param2GetRequest = (
	args: ExtractArgs<Models.Param1Param2Get>,
) => {
	return {
		endpoint: `/${String(args.params.param1)}/${String(args.params.param2)}`,
		method: "GET",
		search: args.search,
	};
};

const makeHelloParam1Param2GetRequest = (
	args: ExtractArgs<Models.HelloParam1Param2Get>,
) => {
	return {
		endpoint: `/hello/${String(args.params.param1)}/${String(args.params.param2)}`,
		method: "GET",
		search: args.search,
	};
};

const makeWorldParam1Param2GetRequest = (
	args: ExtractArgs<Models.WorldParam1Param2Get>,
) => {
	return {
		endpoint: `/world/${String(args.params.param1)}/${String(args.params.param2)}`,
		method: "GET",
		search: args.search,
	};
};

const makeLalalaParam1Param2GetRequest = (
	args: ExtractArgs<Models.LalalaParam1Param2Get>,
) => {
	return {
		endpoint: `/lalala/${String(args.params.param1)}/${String(args.params.param2)}`,
		method: "GET",
		search: args.search,
	};
};

const makeYesyesParam2GetRequest = (
	args: ExtractArgs<Models.YesyesParam2Get>,
) => {
	return {
		endpoint: `/yesyes/${String(args.params.param2)}`,
		method: "GET",
		search: args.search,
	};
};

const makeOkayParam1LetsgoGetRequest = (
	args: ExtractArgs<Models.OkayParam1LetsgoGet>,
) => {
	return {
		endpoint: `/okay/${String(args.params.param1)}/letsgo`,
		method: "GET",
		search: args.search,
	};
};

const makeDenemeParam1Param2GetRequest = (
	args: ExtractArgs<Models.DenemeParam1Param2Get>,
) => {
	return {
		endpoint: `/deneme/${String(args.params.param1)}/${String(args.params.param2)}`,
		method: "GET",
		search: args.search,
	};
};

const makeWeGotThisGetRequest = (args: ExtractArgs<Models.WeGotThisGet>) => {
	return {
		endpoint: "/we/got/this",
		method: "GET",
		search: args.search,
	};
};

const makeOhmyohmyGetRequest = (args: ExtractArgs<Models.OhmyohmyGet>) => {
	return {
		endpoint: "/ohmyohmy",
		method: "GET",
		search: args.search,
	};
};

const make_2brosGetRequest = (args: ExtractArgs<Models._2brosGet>) => {
	return {
		endpoint: "/2bros",
		method: "GET",
		search: args.search,
	};
};

const makeChillinInAHottubGetRequest = (
	args: ExtractArgs<Models.ChillinInAHottubGet>,
) => {
	return {
		endpoint: "/chillin/in/a/hottub",
		method: "GET",
		search: args.search,
	};
};

const make_5FeetApartCuzTheyreNotGayGetRequest = (
	args: ExtractArgs<Models._5FeetApartCuzTheyreNotGayGet>,
) => {
	return {
		endpoint: "/5/feet/apart/cuz/theyre/not/gay",
		method: "GET",
		search: args.search,
	};
};

const makeVerywild_GetRequest = (args: ExtractArgs<Models.Verywild_Get>) => {
	return {
		endpoint: `/verywild/${String(args.params["*"])}`,
		method: "GET",
		search: args.search,
	};
};

const makeCraaaazy_GetRequest = (args: ExtractArgs<Models.Craaaazy_Get>) => {
	return {
		endpoint: `/craaaazy/${String(args.params["*"])}`,
		method: "GET",
		search: args.search,
	};
};

const makeUsersPostRequest = (args: ExtractArgs<Models.UsersPost>) => {
	return {
		endpoint: "/users",
		method: "POST",
		search: args.search,
		body: args.body,
	};
};

const makeUsersGetRequest = (args: ExtractArgs<Models.UsersGet>) => {
	return {
		endpoint: "/users",
		method: "GET",
		search: args.search,
	};
};

const makeUsersIdGetRequest = (args: ExtractArgs<Models.UsersIdGet>) => {
	return {
		endpoint: `/users/${String(args.params.id)}`,
		method: "GET",
		search: args.search,
	};
};

const makeUsersIdPutRequest = (args: ExtractArgs<Models.UsersIdPut>) => {
	return {
		endpoint: `/users/${String(args.params.id)}`,
		method: "PUT",
		search: args.search,
		body: args.body,
	};
};

const makeUsersIdDeleteRequest = (args: ExtractArgs<Models.UsersIdDelete>) => {
	return {
		endpoint: `/users/${String(args.params.id)}`,
		method: "DELETE",
		search: args.search,
	};
};

const makeUsersIdPostsPostRequest = (
	args: ExtractArgs<Models.UsersIdPostsPost>,
) => {
	return {
		endpoint: `/users/${String(args.params.id)}/posts`,
		method: "POST",
		search: args.search,
		body: args.body,
	};
};

const makeOrgsPostRequest = (args: ExtractArgs<Models.OrgsPost>) => {
	return {
		endpoint: "/orgs",
		method: "POST",
		search: args.search,
		body: args.body,
	};
};

const makeOrgsOrgIdMembersGetRequest = (
	args: ExtractArgs<Models.OrgsOrgIdMembersGet>,
) => {
	return {
		endpoint: `/orgs/${String(args.params.orgId)}/members`,
		method: "GET",
		search: args.search,
	};
};

const makeOrgsOrgIdMembersMemberIdPutRequest = (
	args: ExtractArgs<Models.OrgsOrgIdMembersMemberIdPut>,
) => {
	return {
		endpoint: `/orgs/${String(args.params.orgId)}/members/${String(args.params.memberId)}`,
		method: "PUT",
		search: args.search,
		body: args.body,
	};
};

const makeOrgsOrgIdMembersMemberIdDeleteRequest = (
	args: ExtractArgs<Models.OrgsOrgIdMembersMemberIdDelete>,
) => {
	return {
		endpoint: `/orgs/${String(args.params.orgId)}/members/${String(args.params.memberId)}`,
		method: "DELETE",
		search: args.search,
	};
};

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

	public fetchFn: <R = unknown>(args: ReqArgs) => Promise<R> = async (args) => {
		const url = new URL(args.endpoint, this.baseUrl);
		const headers = new Headers(args.headers);
		const method: RequestInit["method"] = args.method;
		let body: RequestInit["body"];

		if (args.search) {
			for (const [key, val] of Object.entries(args.search)) {
				if (val == null) {
					continue;
				}
				url.searchParams.append(key, String(val));
			}
		}

		if (args.body) {
			if (!headers.has("Content-Type") || !headers.has("content-type")) {
				headers.set("Content-Type", "application/json");
			}
			body = JSON.stringify(args.body);
		}
		const res = await fetch(url, { method, headers, body, ...args.init });
		return await C.Parser.parseBody(res);
	};

	public setFetchFn(cb: <R = unknown>(args: ReqArgs) => Promise<R>) {
		return (this.fetchFn = cb);
	}

	public readonly endpoints = {
		param1Param2Get: (p: ExtractArgs<Models.Param1Param2Get>["params"]) =>
			`/${String(p.param1)}/${String(p.param2)}`,
		helloParam1Param2Get: (
			p: ExtractArgs<Models.HelloParam1Param2Get>["params"],
		) => `/hello/${String(p.param1)}/${String(p.param2)}`,
		worldParam1Param2Get: (
			p: ExtractArgs<Models.WorldParam1Param2Get>["params"],
		) => `/world/${String(p.param1)}/${String(p.param2)}`,
		lalalaParam1Param2Get: (
			p: ExtractArgs<Models.LalalaParam1Param2Get>["params"],
		) => `/lalala/${String(p.param1)}/${String(p.param2)}`,
		yesyesParam2Get: (p: ExtractArgs<Models.YesyesParam2Get>["params"]) =>
			`/yesyes/${String(p.param2)}`,
		okayParam1LetsgoGet: (
			p: ExtractArgs<Models.OkayParam1LetsgoGet>["params"],
		) => `/okay/${String(p.param1)}/letsgo`,
		denemeParam1Param2Get: (
			p: ExtractArgs<Models.DenemeParam1Param2Get>["params"],
		) => `/deneme/${String(p.param1)}/${String(p.param2)}`,
		weGotThisGet: "/we/got/this",
		ohmyohmyGet: "/ohmyohmy",
		_2brosGet: "/2bros",
		chillinInAHottubGet: "/chillin/in/a/hottub",
		_5FeetApartCuzTheyreNotGayGet: "/5/feet/apart/cuz/theyre/not/gay",
		verywild_Get: (p: ExtractArgs<Models.Verywild_Get>["params"]) =>
			`/verywild/${String(p["*"])}`,
		craaaazy_Get: (p: ExtractArgs<Models.Craaaazy_Get>["params"]) =>
			`/craaaazy/${String(p["*"])}`,
		usersPost: "/users",
		usersGet: "/users",
		usersIdGet: (p: ExtractArgs<Models.UsersIdGet>["params"]) =>
			`/users/${String(p.id)}`,
		usersIdPut: (p: ExtractArgs<Models.UsersIdPut>["params"]) =>
			`/users/${String(p.id)}`,
		usersIdDelete: (p: ExtractArgs<Models.UsersIdDelete>["params"]) =>
			`/users/${String(p.id)}`,
		usersIdPostsPost: (p: ExtractArgs<Models.UsersIdPostsPost>["params"]) =>
			`/users/${String(p.id)}/posts`,
		orgsPost: "/orgs",
		orgsOrgIdMembersGet: (
			p: ExtractArgs<Models.OrgsOrgIdMembersGet>["params"],
		) => `/orgs/${String(p.orgId)}/members`,
		orgsOrgIdMembersMemberIdPut: (
			p: ExtractArgs<Models.OrgsOrgIdMembersMemberIdPut>["params"],
		) => `/orgs/${String(p.orgId)}/members/${String(p.memberId)}`,
		orgsOrgIdMembersMemberIdDelete: (
			p: ExtractArgs<Models.OrgsOrgIdMembersMemberIdDelete>["params"],
		) => `/orgs/${String(p.orgId)}/members/${String(p.memberId)}`,
	};

	public param1Param2Get = (args: ExtractArgs<Models.Param1Param2Get>) => {
		return this.fetchFn<Models.Param1Param2Get["response"]>(
			makeParam1Param2GetRequest(args),
		);
	};

	public helloParam1Param2Get = (
		args: ExtractArgs<Models.HelloParam1Param2Get>,
	) => {
		return this.fetchFn<Models.HelloParam1Param2Get["response"]>(
			makeHelloParam1Param2GetRequest(args),
		);
	};

	public worldParam1Param2Get = (
		args: ExtractArgs<Models.WorldParam1Param2Get>,
	) => {
		return this.fetchFn<Models.WorldParam1Param2Get["response"]>(
			makeWorldParam1Param2GetRequest(args),
		);
	};

	public lalalaParam1Param2Get = (
		args: ExtractArgs<Models.LalalaParam1Param2Get>,
	) => {
		return this.fetchFn<Models.LalalaParam1Param2Get["response"]>(
			makeLalalaParam1Param2GetRequest(args),
		);
	};

	public yesyesParam2Get = (args: ExtractArgs<Models.YesyesParam2Get>) => {
		return this.fetchFn<Models.YesyesParam2Get["response"]>(
			makeYesyesParam2GetRequest(args),
		);
	};

	public okayParam1LetsgoGet = (
		args: ExtractArgs<Models.OkayParam1LetsgoGet>,
	) => {
		return this.fetchFn<Models.OkayParam1LetsgoGet["response"]>(
			makeOkayParam1LetsgoGetRequest(args),
		);
	};

	public denemeParam1Param2Get = (
		args: ExtractArgs<Models.DenemeParam1Param2Get>,
	) => {
		return this.fetchFn<Models.DenemeParam1Param2Get["response"]>(
			makeDenemeParam1Param2GetRequest(args),
		);
	};

	public weGotThisGet = (args: ExtractArgs<Models.WeGotThisGet>) => {
		return this.fetchFn<Models.WeGotThisGet["response"]>(
			makeWeGotThisGetRequest(args),
		);
	};

	public ohmyohmyGet = (args: ExtractArgs<Models.OhmyohmyGet>) => {
		return this.fetchFn<Models.OhmyohmyGet["response"]>(
			makeOhmyohmyGetRequest(args),
		);
	};

	public _2brosGet = (args: ExtractArgs<Models._2brosGet>) => {
		return this.fetchFn<Models._2brosGet["response"]>(
			make_2brosGetRequest(args),
		);
	};

	public chillinInAHottubGet = (
		args: ExtractArgs<Models.ChillinInAHottubGet>,
	) => {
		return this.fetchFn<Models.ChillinInAHottubGet["response"]>(
			makeChillinInAHottubGetRequest(args),
		);
	};

	public _5FeetApartCuzTheyreNotGayGet = (
		args: ExtractArgs<Models._5FeetApartCuzTheyreNotGayGet>,
	) => {
		return this.fetchFn<Models._5FeetApartCuzTheyreNotGayGet["response"]>(
			make_5FeetApartCuzTheyreNotGayGetRequest(args),
		);
	};

	public verywild_Get = (args: ExtractArgs<Models.Verywild_Get>) => {
		return this.fetchFn<Models.Verywild_Get["response"]>(
			makeVerywild_GetRequest(args),
		);
	};

	public craaaazy_Get = (args: ExtractArgs<Models.Craaaazy_Get>) => {
		return this.fetchFn<Models.Craaaazy_Get["response"]>(
			makeCraaaazy_GetRequest(args),
		);
	};

	public usersPost = (args: ExtractArgs<Models.UsersPost>) => {
		return this.fetchFn<Models.UsersPost["response"]>(
			makeUsersPostRequest(args),
		);
	};

	public usersGet = (args: ExtractArgs<Models.UsersGet>) => {
		return this.fetchFn<Models.UsersGet["response"]>(makeUsersGetRequest(args));
	};

	public usersIdGet = (args: ExtractArgs<Models.UsersIdGet>) => {
		return this.fetchFn<Models.UsersIdGet["response"]>(
			makeUsersIdGetRequest(args),
		);
	};

	public usersIdPut = (args: ExtractArgs<Models.UsersIdPut>) => {
		return this.fetchFn<Models.UsersIdPut["response"]>(
			makeUsersIdPutRequest(args),
		);
	};

	public usersIdDelete = (args: ExtractArgs<Models.UsersIdDelete>) => {
		return this.fetchFn<Models.UsersIdDelete["response"]>(
			makeUsersIdDeleteRequest(args),
		);
	};

	public usersIdPostsPost = (args: ExtractArgs<Models.UsersIdPostsPost>) => {
		return this.fetchFn<Models.UsersIdPostsPost["response"]>(
			makeUsersIdPostsPostRequest(args),
		);
	};

	public orgsPost = (args: ExtractArgs<Models.OrgsPost>) => {
		return this.fetchFn<Models.OrgsPost["response"]>(makeOrgsPostRequest(args));
	};

	public orgsOrgIdMembersGet = (
		args: ExtractArgs<Models.OrgsOrgIdMembersGet>,
	) => {
		return this.fetchFn<Models.OrgsOrgIdMembersGet["response"]>(
			makeOrgsOrgIdMembersGetRequest(args),
		);
	};

	public orgsOrgIdMembersMemberIdPut = (
		args: ExtractArgs<Models.OrgsOrgIdMembersMemberIdPut>,
	) => {
		return this.fetchFn<Models.OrgsOrgIdMembersMemberIdPut["response"]>(
			makeOrgsOrgIdMembersMemberIdPutRequest(args),
		);
	};

	public orgsOrgIdMembersMemberIdDelete = (
		args: ExtractArgs<Models.OrgsOrgIdMembersMemberIdDelete>,
	) => {
		return this.fetchFn<Models.OrgsOrgIdMembersMemberIdDelete["response"]>(
			makeOrgsOrgIdMembersMemberIdDeleteRequest(args),
		);
	};
}
export type { Models, Args };

export {
	makeParam1Param2GetRequest,
	makeHelloParam1Param2GetRequest,
	makeWorldParam1Param2GetRequest,
	makeLalalaParam1Param2GetRequest,
	makeYesyesParam2GetRequest,
	makeOkayParam1LetsgoGetRequest,
	makeDenemeParam1Param2GetRequest,
	makeWeGotThisGetRequest,
	makeOhmyohmyGetRequest,
	make_2brosGetRequest,
	makeChillinInAHottubGetRequest,
	make_5FeetApartCuzTheyreNotGayGetRequest,
	makeVerywild_GetRequest,
	makeCraaaazy_GetRequest,
	makeUsersPostRequest,
	makeUsersGetRequest,
	makeUsersIdGetRequest,
	makeUsersIdPutRequest,
	makeUsersIdDeleteRequest,
	makeUsersIdPostsPostRequest,
	makeOrgsPostRequest,
	makeOrgsOrgIdMembersGetRequest,
	makeOrgsOrgIdMembersMemberIdPutRequest,
	makeOrgsOrgIdMembersMemberIdDeleteRequest,
	CorpusApi,
};
