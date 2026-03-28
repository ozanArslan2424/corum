import type { CRequest } from "@/CRequest/CRequest";
import type { RouterReturnData } from "@/Router/types/RouterReturnData";
import type { RouterRouteData } from "@/Router/types/RouterRouteData";
import { objGetKeys } from "@/utils/objGetKeys";
import type { Func } from "@/utils/types/Func";
import type { RouterAdapterInterface } from "@/Router/adapters/RouterAdapterInterface";
import { strIsEqual } from "@/utils/strIsEqual";

type ParamBranch = {
	paramName: string;
	store: RouterRouteData | null;
	wildcardStore: RouterRouteData | null;
	branch: Branch | null;
};

type Branch = {
	part: string;
	store: RouterRouteData | null;
	wildcardStore: RouterRouteData | null;
	paramBranch: ParamBranch | null;
	children: Map<number, Branch> | null;
};

/**
 * Massive props to the medleyjs team for this incredible URL router implementation.
 * The core branch-matching algorithm used here is lifted directly from their work.
 *
 * @see {@link https://github.com/medleyjs/router @medley/router}
 * @author {@link https://github.com/nwoltman nwoltman (Nathan Woltman)}
 *
 * @remarks
 * Original code was JavaScript — converted to TypeScript, with renamed
 * types and variables to fit this package's conventions, and minor adjustments to
 * a handful of methods.
 *
 * BranchAdapter benchmark results: (300 routes)
 * Setup Time:    0.36
 * Lookups:       30,000
 * Hit rate:      100.00%
 * Accuracy:      100.00%
 * Avg:           0.0001ms
 * Min:           0.0000ms
 * Max:           0.1229ms
 * P95:           0.0000ms
 * P99:           0.0005ms
 * RPS:           17335289
 */
export class BranchAdapter implements RouterAdapterInterface {
	private _root: Branch = this.createBranch("/", null);
	private storeFactory: Func<[], RouterRouteData> = () => Object.create(null);

	find(req: CRequest): RouterReturnData | null {
		const method = req.method;
		const pathname = req.urlObject.pathname;
		const pathlength = pathname.length;
		const searchParams = req.urlObject.searchParams;

		const result = this.findRoute(pathname, pathlength, this._root, 0);
		if (!result) return null;
		if (!strIsEqual(method, result.store.method, "lower")) return null;

		return {
			route: result.store,
			params: result.params,
			search: Object.fromEntries(searchParams),
		};
	}

	add(data: RouterRouteData): void {
		const store = this.createBranchStore(data.endpoint);
		const assign = <K extends keyof RouterRouteData>(key: K) => {
			store[key] = data[key];
		};
		for (const key of objGetKeys<keyof RouterRouteData>(data)) {
			assign(key);
		}
	}

	list(): Array<RouterRouteData> {
		const routes: Array<RouterRouteData> = [];

		const walk = (branch: Branch) => {
			if (branch.store !== null) routes.push(branch.store);
			if (branch.wildcardStore !== null) routes.push(branch.wildcardStore);

			if (branch.paramBranch !== null) {
				if (branch.paramBranch.store !== null)
					routes.push(branch.paramBranch.store);
				if (branch.paramBranch.wildcardStore !== null)
					routes.push(branch.paramBranch.wildcardStore);
				if (branch.paramBranch.branch !== null) walk(branch.paramBranch.branch);
			}

			if (branch.children !== null) {
				for (const child of branch.children.values()) {
					walk(child);
				}
			}
		};

		walk(this._root);
		return routes;
	}

	private createBranchStore(path: string) {
		// begin with slash
		if (path === "" || path[0] !== "/") {
			path = `/${path}`;
		}

		const endsWithWildcard = path.endsWith("*");

		if (endsWithWildcard) {
			path = path.slice(0, -1); // Slice off trailing '*'
		}

		const staticParts = path.split(/:.+?(?=\/|$)/);
		const paramParts = path.match(/:.+?(?=\/|$)/g) || [];

		// remove last part if empty
		if (staticParts[staticParts.length - 1] === "") {
			staticParts.pop();
		}

		let branch = this._root;
		let paramPartsIndex = 0;

		for (let i = 0; i < staticParts.length; ++i) {
			let pathPart = staticParts[i] as string;

			if (i > 0) {
				// Set parametric properties on the branch
				const paramName = (paramParts[paramPartsIndex++] as string).slice(1);

				if (branch.paramBranch === null) {
					branch.paramBranch = this.createParamBranch(paramName);
				} else if (branch.paramBranch.paramName !== paramName) {
					throw new Error(
						`Cannot create route "${path}" with parameter "${paramName}". A route already exists with a different parameter name ("${branch.paramBranch.paramName}") in the same location.`,
					);
				}

				const { paramBranch: parametricChild } = branch;

				if (parametricChild.branch === null) {
					branch = parametricChild.branch = this.createBranch(pathPart, null);
					continue;
				}

				branch = parametricChild.branch;
			}

			for (let j = 0; ; ) {
				if (j === pathPart.length) {
					if (j < branch.part.length) {
						// Move the current branch down
						const childBranch = this.cloneBranch(branch, branch.part.slice(j));
						Object.assign(branch, this.createBranch(pathPart, [childBranch]));
					}
					break;
				}

				if (j === branch.part.length) {
					// Add static child
					if (branch.children === null) {
						branch.children = new Map();
					} else if (branch.children.has(pathPart.charCodeAt(j))) {
						// Re-run loop with existing static branch
						branch = branch.children.get(pathPart.charCodeAt(j))!;
						pathPart = pathPart.slice(j);
						j = 0;
						continue;
					}

					// Create new branch
					const childBranch = this.createBranch(pathPart.slice(j), null);
					branch.children.set(pathPart.charCodeAt(j), childBranch);
					branch = childBranch;

					break;
				}

				if (pathPart[j] !== branch.part[j]) {
					// Split the branch
					const existingChild = this.cloneBranch(branch, branch.part.slice(j));
					const newChild = this.createBranch(pathPart.slice(j), null);

					Object.assign(
						branch,
						this.createBranch(branch.part.slice(0, j), [
							existingChild,
							newChild,
						]),
					);

					branch = newChild;

					break;
				}

				++j;
			}
		}

		if (paramPartsIndex < paramParts.length) {
			// The final part is a parameter
			const param = paramParts[paramPartsIndex] as string;
			const paramName = param.slice(1);

			if (branch.paramBranch === null) {
				branch.paramBranch = this.createParamBranch(paramName);
			} else if (branch.paramBranch.paramName !== paramName) {
				throw new Error(
					`Cannot create route "${path}" with parameter "${paramName}". A route already exists with a different parameter name ("${branch.paramBranch.paramName}") in the same location.`,
				);
			}

			if (branch.paramBranch.store === null) {
				branch.paramBranch.store = this.storeFactory();
			}

			return branch.paramBranch.store;
		}

		if (endsWithWildcard) {
			// The final part is a wildcard
			if (branch.wildcardStore === null) {
				branch.wildcardStore = this.storeFactory();
			}

			return branch.wildcardStore;
		}

		// The final part is static
		if (branch.store === null) {
			branch.store = this.storeFactory();
		}

		return branch.store;
	}

	private cloneBranch(branch: Branch, part: string): Branch {
		return {
			...branch,
			part: part,
		};
	}

	private createBranch(part: string, children: Branch[] | null): Branch {
		return {
			part: part,
			store: null,
			children: children
				? new Map(children.map((child) => [child.part.charCodeAt(0), child]))
				: null,
			paramBranch: null,
			wildcardStore: null,
		};
	}

	private createParamBranch(paramName: string): ParamBranch {
		return {
			paramName,
			store: null,
			branch: null,
			wildcardStore: null,
		};
	}

	private findRoute(
		url: string,
		urlLength: number,
		branch: Branch,
		startIndex: number,
	): {
		store: RouterRouteData;
		params: Record<string, string>;
	} | null {
		const part = branch.part;
		const pathPartLen = part.length;
		const pathPartEndIndex = startIndex + pathPartLen;

		// Only check the pathPart if its length is > 1 since the parent has
		// already checked that the url matches the first character
		if (pathPartLen > 1) {
			if (pathPartEndIndex > urlLength) {
				return null;
			}

			if (pathPartLen < 15) {
				// Using a loop is faster for short strings
				for (let i = 1, j = startIndex + 1; i < pathPartLen; ++i, ++j) {
					if (part[i] !== url[j]) {
						return null;
					}
				}
			} else if (url.slice(startIndex, pathPartEndIndex) !== part) {
				return null;
			}
		}

		startIndex = pathPartEndIndex;

		if (startIndex === urlLength) {
			// Reached the end of the URL
			if (branch.store !== null) {
				return {
					store: branch.store,
					params: {},
				};
			}

			if (branch.wildcardStore !== null) {
				return {
					store: branch.wildcardStore,
					params: { "*": "" },
				};
			}

			return null;
		}

		if (branch.children !== null) {
			const staticChild = branch.children.get(url.charCodeAt(startIndex));

			if (staticChild !== undefined) {
				const route = this.findRoute(url, urlLength, staticChild, startIndex);

				if (route !== null) {
					return route;
				}
			}
		}

		if (branch.paramBranch !== null) {
			const paramBranch = branch.paramBranch;
			const slashIndex = url.indexOf("/", startIndex);

			if (slashIndex !== startIndex) {
				// Params cannot be empty
				if (slashIndex === -1 || slashIndex >= urlLength) {
					if (paramBranch.store !== null) {
						const params: Record<string, string> = {};
						params[paramBranch.paramName] = url.slice(startIndex, urlLength);
						return {
							store: paramBranch.store,
							params,
						};
					}
				} else if (paramBranch.branch !== null) {
					const route = this.findRoute(
						url,
						urlLength,
						paramBranch.branch,
						slashIndex,
					);

					if (route !== null) {
						route.params[paramBranch.paramName] = url.slice(
							startIndex,
							slashIndex,
						);
						return route;
					}
				}
			}
		}

		if (branch.wildcardStore !== null) {
			return {
				store: branch.wildcardStore,
				params: {
					"*": url.slice(startIndex, urlLength),
				},
			};
		}

		return null;
	}
}
