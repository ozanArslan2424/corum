import C from "@/index";
import { createTestServer } from "../utils/createTestServer";
import { TEST_PORT } from "../utils/req";

const server = createTestServer();

new C.Route("/sse", () => {
	return C.Response.sse((send) => {
		const interval = setInterval(() => {
			send({ event: "ping", data: { time: Date.now() } });
		}, 1000);

		return () => clearInterval(interval);
	});
});

await server.listen(TEST_PORT);
