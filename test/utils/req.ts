import { _globalPrefixEnvKey } from "@/constants/_globalPrefixEnvKey";
import { joinPathSegments } from "@/utils/joinPathSegments";
import { Config } from "../../dist";

export function req(addr: string, init?: RequestInit) {
	return new Request(
		`http://localhost:4444${joinPathSegments(
			Config.get(_globalPrefixEnvKey, { fallback: "" }),
			addr,
		)}`,
		init,
	);
}
