import { TEST_PORT } from "test/utils/TEST_PORT";

export const req = (path: string, init?: RequestInit) =>
	new Request(`http://localhost:${TEST_PORT}${path}`, init);
