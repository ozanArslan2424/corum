import C from "../../dist";

export function createTestServer() {
	const s = new C.Server();
	s.setOnError((err) => {
		console.error(err);
		process.exit(1);
	});
	s.setOnNotFound((req) => {
		console.error(req);
		process.exit(1);
	});
	return s;
}
