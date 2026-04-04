import { log as _log } from "@/Utils/log";
import { createTestWebSocketRoute } from "./createTestWebSocketRoute";
import { TestHelper } from "./TestHelper";
import { TC } from "../_modules";

const PORT = 9876;
const BASE_URL = `ws://localhost:${PORT}`;
const SILENT = process.argv[2] === "-s";
const log = SILENT ? _log.noop : _log;
const T = new TestHelper(log);
const server = new TC.Server();

async function run(withAbstract: boolean) {
	log.info("Setting up WebSocket route...");
	createTestWebSocketRoute(log, withAbstract);

	const WS_URL = `${BASE_URL}/ws`;
	log.info(`WebSocket URL: ${WS_URL}`);

	// ── helpers ──────────────────────────────────────────────────────────────────

	async function send(ws: WebSocket, payload: object) {
		await new Promise((resolve) => setTimeout(resolve, 10));
		const message = T.stringify(payload);
		log.debug(`Sending message: ${message}`);
		ws.send(message);
	}

	function close(ws: WebSocket): Promise<void> {
		log.debug(`Closing WebSocket connection...`);
		return new Promise((resolve) => {
			ws.onclose = () => {
				log.success(`WebSocket closed successfully`);
				resolve();
			};
			ws.close();
		});
	}

	function makeClient(
		label: string,
	): Promise<{ ws: WebSocket; next: () => Promise<any> }> {
		log.info(`Creating client: ${label}`);
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(WS_URL);
			const queue: object[] = [];
			const waiters: ((v: object) => void)[] = [];

			ws.onmessage = (e) => {
				const msg = JSON.parse(e.data as string);
				log.info(`[${label}] << Received:`, msg);
				const waiter = waiters.shift();
				if (waiter) waiter(msg);
				else queue.push(msg);
			};

			const next = (): Promise<object> => {
				if (queue.length) return Promise.resolve(queue.shift()!);
				return new Promise((res) => waiters.push(res));
			};

			ws.onopen = () => {
				log.success(`[${label}] Connected to WebSocket server`);
				resolve({ ws, next });
			};
			ws.onerror = (error) => {
				log.error(`[${label}] Connection error:`, error);
				reject(new Error(`[${label}] connection error`));
			};
		});
	}

	// ── test ─────────────────────────────────────────────────────────────────────

	async function runTests() {
		// Three clients
		log.info("Creating three test clients...");
		const { ws: alice, next: aliceNext } = await makeClient("alice");
		const { ws: bob, next: bobNext } = await makeClient("bob");
		const { ws: carol, next: carolNext } = await makeClient("carol");
		log.success("All three clients connected");

		// Consume the "connected" greeting from each
		log.info("Consuming connected greetings...");
		const aliceGreeting = await aliceNext();
		const bobGreeting = await bobNext();
		const carolGreeting = await carolNext();

		log.debug("[alice] greeting:", aliceGreeting);
		log.debug("[bob]   greeting:", bobGreeting);
		log.debug("[carol] greeting:", carolGreeting);

		T.expect("alice greeting event", aliceGreeting).toHaveProperty(
			"event",
			"connected",
		);
		T.expect("bob greeting event", bobGreeting).toHaveProperty(
			"event",
			"connected",
		);
		T.expect("carol greeting event", carolGreeting).toHaveProperty(
			"event",
			"connected",
		);
		log.success("All clients received connected greetings");

		// ── ping / pong ───────────────────────────────────────────────────────────
		log.info("Testing ping/pong...");
		await send(alice, { event: "ping", data: { ts: Date.now() } });
		const pong = await aliceNext();
		log.info("[alice] pong received:", pong);
		T.expect("pong event", pong).toHaveProperty("event", "pong");
		T.expect("pong has data", pong).toHaveProperty("data");
		log.success("Ping/pong successful");

		// ── subscribe alice + bob to "news", carol to "sports" ───────────────────
		log.info("Testing subscriptions...");
		await send(alice, { event: "subscribe", topic: "news" });
		await send(bob, { event: "subscribe", topic: "news" });
		await send(carol, { event: "subscribe", topic: "sports" });

		const aliceSub = await aliceNext();
		const bobSub = await bobNext();
		const carolSub = await carolNext();

		log.info("[alice] subscribed:", aliceSub);
		log.info("[bob]   subscribed:", bobSub);
		log.info("[carol] subscribed:", carolSub);

		T.expect("alice sub event", aliceSub).toHaveProperty("event", "subscribed");
		T.expect("alice sub topic", aliceSub).toHaveProperty("topic", "news");
		T.expect("bob sub event", bobSub).toHaveProperty("event", "subscribed");
		T.expect("bob sub topic", bobSub).toHaveProperty("topic", "news");
		T.expect("carol sub event", carolSub).toHaveProperty("event", "subscribed");
		T.expect("carol sub topic", carolSub).toHaveProperty("topic", "sports");
		log.success("Initial subscriptions successful");

		// ── carol also subscribes to "news" ───────────────────────────────────────
		log.info("Carol subscribing to news...");
		await send(carol, { event: "subscribe", topic: "news" });
		const carolSubNews = await carolNext();
		log.info("[carol] subscribed to news:", carolSubNews);
		T.expect("carol sub news event", carolSubNews).toHaveProperty(
			"event",
			"subscribed",
		);
		T.expect("carol sub news topic", carolSubNews).toHaveProperty(
			"topic",
			"news",
		);
		log.success("Carol subscribed to news");

		// ── query subscriptions ───────────────────────────────────────────────────
		log.info("Querying Carol's subscriptions...");
		await send(carol, { event: "subscriptions" });
		const carolSubs = (await carolNext()) as any;
		log.info("[carol] active subscriptions:", carolSubs);
		T.expect("carol subs event", carolSubs).toHaveProperty(
			"event",
			"subscriptions",
		);
		T.expect("carol subs data", carolSubs.data).toEqual(["sports", "news"]);
		T.expect("carol subs length", carolSubs.data?.length).toBe(2);
		log.success("Subscription query successful");

		// ── alice publishes to "news" (bob + carol receive, alice gets ack) ───────
		log.info("Testing publish to news topic...");
		const bobReceives = bobNext();
		const carolReceives = carolNext();

		await send(alice, {
			event: "publish",
			topic: "news",
			data: { headline: "corpus ships" },
		});

		const aliceAck = (await aliceNext()) as any;
		const bobNews = (await bobReceives) as any;
		const carolNews = (await carolReceives) as any;

		log.info("[alice] publish ack:", aliceAck);
		log.info("[bob]   received news:", bobNews);
		log.info("[carol] received news:", carolNews);

		T.expect("alice ack event", aliceAck).toHaveProperty("event", "published");
		T.expect("alice ack topic", aliceAck).toHaveProperty("topic", "news");
		T.expect("alice ack bytes", aliceAck.bytes).toBeGreaterThan(0);
		T.expect("bob news event", bobNews).toHaveProperty("event", "message");
		T.expect("bob news topic", bobNews).toHaveProperty("topic", "news");
		T.expect("bob news headline", bobNews.data?.headline).toBe("corpus ships");
		T.expect("carol news event", carolNews).toHaveProperty("event", "message");
		T.expect("carol news topic", carolNews).toHaveProperty("topic", "news");
		T.expect("carol news headline", carolNews.data?.headline).toBe(
			"corpus ships",
		);
		log.success("Both Bob and Carol received the news message");

		// ── carol publishes to "sports" (only carol is subscribed, she doesn't receive her own) ─
		log.info("Testing publish to sports topic...");
		await send(carol, {
			event: "publish",
			topic: "sports",
			data: { score: "2-1" },
		});
		const carolSportsAck = (await carolNext()) as any;
		log.info("[carol] sports publish ack:", carolSportsAck);
		T.expect("carol sports ack event", carolSportsAck).toHaveProperty(
			"event",
			"published",
		);
		T.expect("carol sports ack topic", carolSportsAck).toHaveProperty(
			"topic",
			"sports",
		);
		T.expect("carol sports ack bytes", carolSportsAck.bytes).toBe(0);
		log.success("Sports publish successful");

		// ── bob unsubscribes from "news" ──────────────────────────────────────────
		log.info("Bob unsubscribing from news...");
		await send(bob, { event: "unsubscribe", topic: "news" });
		const bobUnsub = await bobNext();
		log.info("[bob]   unsubscribed:", bobUnsub);
		T.expect("bob unsub event", bobUnsub).toHaveProperty(
			"event",
			"unsubscribed",
		);
		T.expect("bob unsub topic", bobUnsub).toHaveProperty("topic", "news");
		log.success("Bob unsubscribed successfully");

		// ── alice publishes to "news" again — only carol should receive ───────────
		log.info(
			"Testing publish after unsubscribe (only Carol should receive)...",
		);
		const carolReceives2 = carolNext();

		await send(alice, {
			event: "publish",
			topic: "news",
			data: { headline: "bob missed this" },
		});
		const aliceAck2 = (await aliceNext()) as any;
		const carolNews2 = (await carolReceives2) as any;

		log.info("[alice] publish ack 2:", aliceAck2);
		log.info("[carol] received news after bob left:", carolNews2);

		T.expect("alice ack2 event", aliceAck2).toHaveProperty(
			"event",
			"published",
		);
		T.expect("carol news2 event", carolNews2).toHaveProperty(
			"event",
			"message",
		);
		T.expect("carol news2 topic", carolNews2).toHaveProperty("topic", "news");
		T.expect("carol news2 headline", carolNews2.data?.headline).toBe(
			"bob missed this",
		);

		log.info(
			"Only Carol received the second message (Bob correctly unsubscribed)",
		);

		// ── unknown event ─────────────────────────────────────────────────────────
		log.info("Testing unknown event handling...");
		await send(bob, { event: "explode" });
		const err = (await bobNext()) as any;
		log.info("[bob]   error response:", err);
		T.expect("unknown event error", err).toHaveProperty("event", "error");
		T.expect("unknown event message", err.data).toContain("unknown event");
		log.success("Unknown event handled correctly");

		// ── clean up ──────────────────────────────────────────────────────────────
		log.info("Cleaning up connections...");
		await Promise.all([close(alice), close(bob), close(carol)]);
		log.success("All clients closed successfully");
	}

	try {
		await runTests();
	} catch (err) {
		_log.error("WebSocket Test suite failed:", err);
		T.failures.push(`WebSocket run threw: ${T.stringify(err)}`);
		T.failed++;
	}
}

await server.listen(PORT);

await run(false);
T.logResults("RESULTS FOR WEBSOCKET SIMULATON USING CONSTRUCTOR");

await run(true);
T.logResults("RESULTS FOR WEBSOCKET SIMULATON USING EXTENDED ABSTRACT CLASS");

process.exit(T.failed > 0 ? 1 : 0);
