import { log } from "@/Utils/log";

export {
	C as TC,
	X as TX,
	$registry as $registryTesting,
	Router as RouterTesting,
} from "../dist";

export const testLog = log.noop;
