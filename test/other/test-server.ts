import { TC } from "../_modules";
import { createTestServer } from "../utils/createTestServer";
import { TEST_PORT } from "../utils/req";

const server = createTestServer();

const r1 = new TC.Route("/:param1/:param2", () => "ok");
const r2 = new TC.Route("hello/:param1/:param2", () => "ok");
new TC.Route("/world/:param1/:param2", () => "ok");
new TC.Route("/lalala/:param1/:param2", () => "ok");
new TC.Route("/yesyes/:param2", () => "ok");
new TC.Route("/okay/:param1/letsgo", () => "ok");
new TC.Route("/deneme/:param1/:param2", () => "ok");
new TC.Route("/we/got/this", () => "ok");
new TC.Route("/ohmyohmy", () => "ok");
new TC.Route("/2bros", () => "ok");
new TC.Route("/chillin/in/a/hottub", () => "ok");
new TC.Route("/5/feet/apart/cuz/theyre/not/gay", () => "ok");
new TC.Route("/verywild/*", () => "ok");
new TC.Route("/craaaazy/*", () => "ok");

new TC.Middleware({
	useOn: [r1, r2],
	handler: (c) => {
		c.data = {};
	},
});

void server.listen(TEST_PORT);
