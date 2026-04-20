import { log } from "corpus-utils/internalLog";

export { C as TC, X as TX, $registry as $registryTesting, $registry } from "../src/index";
export { Router as RouterTesting } from "../src/Registry/Router";

export const testLog = log.noop;
