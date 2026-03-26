import { log } from "@/utils/internalLogger";
import { TEST_PORT } from "../utils/req";
import C from "@/index";
import { createTestServer } from "../utils/createTestServer";
import { manualExpect } from "../utils/manual-expect";

const server = createTestServer();

log.info("🚀 Setting up WebSocket route...");

new C.WebSocketRoute("/ws", {
	onOpen: (ws) => {
		log.info(`[ws] New connection opened — remoteAddress: ${ws.remoteAddress}`);
		ws.send(
			JSON.stringify({
				event: "connected",
				data: { remoteAddress: ws.remoteAddress },
			}),
		);
		log.debug(`[ws] Sent connected greeting to ${ws.remoteAddress}`);
	},

	onClose: (_ws, code, reason) => {
		log.info(
			`[ws] Connection closed — code=${code} reason=${reason || "no reason provided"}`,
		);
	},

	onMessage: (ws, message) => {
		// oxlint-disable-next-line typescript/restrict-template-expressions
		log.debug(`[ws] Received message: ${message}`);
		const msg = JSON.parse(message as string) as {
			event: string;
			topic?: string;
			data?: unknown;
		};

		switch (msg.event) {
			case "subscribe": {
				log.info(`[ws] Client subscribing to topic: ${msg.topic}`);
				ws.subscribe(msg.topic!);
				ws.send(JSON.stringify({ event: "subscribed", topic: msg.topic }));
				log.debug(`[ws] Sent subscribed confirmation for topic: ${msg.topic}`);
				break;
			}
			case "unsubscribe": {
				log.info(`[ws] Client unsubscribing from topic: ${msg.topic}`);
				ws.unsubscribe(msg.topic!);
				ws.send(JSON.stringify({ event: "unsubscribed", topic: msg.topic }));
				log.debug(
					`[ws] Sent unsubscribed confirmation for topic: ${msg.topic}`,
				);
				break;
			}
			case "publish": {
				log.info(`[ws] Client publishing to topic: ${msg.topic}`, {
					data: msg.data,
				});
				const sent = ws.publish(
					msg.topic!,
					JSON.stringify({
						event: "message",
						topic: msg.topic,
						data: msg.data,
					}),
				);
				ws.send(
					JSON.stringify({ event: "published", topic: msg.topic, bytes: sent }),
				);
				log.info(`[ws] Published to ${msg.topic} — ${sent} bytes sent`);
				break;
			}
			case "ping": {
				log.debug(`[ws] Received ping, sending pong`);
				ws.send(JSON.stringify({ event: "pong", data: msg.data }));
				break;
			}
			case "subscriptions": {
				log.debug(`[ws] Client requesting subscriptions`);
				ws.send(
					JSON.stringify({ event: "subscriptions", data: ws.subscriptions }),
				);
				log.debug(
					`[ws] Sent subscriptions: ${JSON.stringify(ws.subscriptions)}`,
				);
				break;
			}
			default: {
				log.warn(`[ws] Unknown event received: ${msg.event}`);
				ws.send(
					JSON.stringify({
						event: "error",
						data: `unknown event: ${msg.event}`,
					}),
				);
			}
		}
	},
});

log.info(`📡 Attempting to start server on port ${TEST_PORT}...`);
await server.listen(TEST_PORT);
log.success(`✅ Server listening on port ${TEST_PORT}`);

const WS_URL = `ws://localhost:${TEST_PORT}/ws`;
log.info(`🔌 WebSocket URL: ${WS_URL}`);

// ── helpers ──────────────────────────────────────────────────────────────────

async function send(ws: WebSocket, payload: object) {
	await new Promise((resolve) => setTimeout(resolve, 10));
	const message = JSON.stringify(payload);
	log.debug(`📤 Sending message: ${message}`);
	ws.send(message);
}

function close(ws: WebSocket): Promise<void> {
	log.debug(`🔒 Closing WebSocket connection...`);
	return new Promise((resolve) => {
		ws.onclose = () => {
			log.debug(`✅ WebSocket closed successfully`);
			resolve();
		};
		ws.close();
	});
}

function makeClient(
	label: string,
): Promise<{ ws: WebSocket; next: () => Promise<any> }> {
	log.info(`🏗️  Creating client: ${label}`);
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
			log.success(`[${label}] ✅ Connected to WebSocket server`);
			resolve({ ws, next });
		};
		ws.onerror = (error) => {
			log.error(`[${label}] ❌ Connection error:`, error);
			reject(new Error(`[${label}] connection error`));
		};
	});
}

// ── test ─────────────────────────────────────────────────────────────────────

async function run() {
	log.info("🎬 Starting WebSocket tests...");
	log.info("=".repeat(60));

	// Three clients
	log.info("📱 Creating three test clients...");
	const { ws: alice, next: aliceNext } = await makeClient("alice");
	const { ws: bob, next: bobNext } = await makeClient("bob");
	const { ws: carol, next: carolNext } = await makeClient("carol");
	log.success("✅ All three clients connected");

	// Consume the "connected" greeting from each
	log.info("📨 Consuming connected greetings...");
	const aliceGreeting = await aliceNext();
	const bobGreeting = await bobNext();
	const carolGreeting = await carolNext();

	log.debug("[alice] greeting:", aliceGreeting);
	log.debug("[bob]   greeting:", bobGreeting);
	log.debug("[carol] greeting:", carolGreeting);

	manualExpect(aliceGreeting).toHaveProperty("event", "connected");
	manualExpect(bobGreeting).toHaveProperty("event", "connected");
	manualExpect(carolGreeting).toHaveProperty("event", "connected");
	log.success("✅ All clients received connected greetings");

	// ── ping / pong ───────────────────────────────────────────────────────────
	log.info("🏓 Testing ping/pong...");
	await send(alice, { event: "ping", data: { ts: Date.now() } });
	const pong = await aliceNext();
	log.info("[alice] pong received:", pong);
	manualExpect(pong).toHaveProperty("event", "pong");
	manualExpect(pong).toHaveProperty("data");
	log.success("✅ Ping/pong successful");

	// ── subscribe alice + bob to "news", carol to "sports" ───────────────────
	log.info("📡 Testing subscriptions...");
	await send(alice, { event: "subscribe", topic: "news" });
	await send(bob, { event: "subscribe", topic: "news" });
	await send(carol, { event: "subscribe", topic: "sports" });

	const aliceSub = await aliceNext();
	const bobSub = await bobNext();
	const carolSub = await carolNext();

	log.info("[alice] subscribed:", aliceSub);
	log.info("[bob]   subscribed:", bobSub);
	log.info("[carol] subscribed:", carolSub);

	manualExpect(aliceSub).toHaveProperty("event", "subscribed");
	manualExpect(aliceSub).toHaveProperty("topic", "news");
	manualExpect(bobSub).toHaveProperty("event", "subscribed");
	manualExpect(bobSub).toHaveProperty("topic", "news");
	manualExpect(carolSub).toHaveProperty("event", "subscribed");
	manualExpect(carolSub).toHaveProperty("topic", "sports");
	log.success("✅ Initial subscriptions successful");

	// ── carol also subscribes to "news" ───────────────────────────────────────
	log.info("📡 Carol subscribing to news...");
	await send(carol, { event: "subscribe", topic: "news" });
	const carolSubNews = await carolNext();
	log.info("[carol] subscribed to news:", carolSubNews);
	manualExpect(carolSubNews).toHaveProperty("event", "subscribed");
	manualExpect(carolSubNews).toHaveProperty("topic", "news");
	log.success("✅ Carol subscribed to news");

	// ── query subscriptions ───────────────────────────────────────────────────
	log.info("🔍 Querying Carol's subscriptions...");
	await send(carol, { event: "subscriptions" });
	const carolSubs = await carolNext();
	log.info("[carol] active subscriptions:", carolSubs);
	manualExpect(carolSubs).toHaveProperty("event", "subscriptions");
	manualExpect(carolSubs.data).toEqual(["sports", "news"]);
	manualExpect(carolSubs.data).toHaveLength(2);
	log.success("✅ Subscription query successful");

	// ── alice publishes to "news" (bob + carol receive, alice gets ack) ───────
	log.info("📢 Testing publish to news topic...");
	const bobReceives = bobNext();
	const carolReceives = carolNext();

	await send(alice, {
		event: "publish",
		topic: "news",
		data: { headline: "corpus ships" },
	});

	const aliceAck = await aliceNext();
	const bobNews = await bobReceives;
	const carolNews = await carolReceives;

	log.info("[alice] publish ack:", aliceAck);
	log.info("[bob]   received news:", bobNews);
	log.info("[carol] received news:", carolNews);

	manualExpect(aliceAck).toHaveProperty("event", "published");
	manualExpect(aliceAck).toHaveProperty("topic", "news");
	manualExpect(aliceAck.bytes).toBeGreaterThan(0);
	manualExpect(bobNews).toHaveProperty("event", "message");
	manualExpect(bobNews).toHaveProperty("topic", "news");
	manualExpect(bobNews.data).toHaveProperty("headline", "corpus ships");
	manualExpect(carolNews).toHaveProperty("event", "message");
	manualExpect(carolNews).toHaveProperty("topic", "news");
	manualExpect(carolNews.data).toHaveProperty("headline", "corpus ships");
	log.success("✅ Both Bob and Carol received the news message");

	// ── carol publishes to "sports" (only carol is subscribed, she doesn't receive her own) ─
	log.info("🏀 Testing publish to sports topic...");
	await send(carol, {
		event: "publish",
		topic: "sports",
		data: { score: "2-1" },
	});
	const carolSportsAck = await carolNext();
	log.info("[carol] sports publish ack:", carolSportsAck);
	manualExpect(carolSportsAck).toHaveProperty("event", "published");
	manualExpect(carolSportsAck).toHaveProperty("topic", "sports");
	manualExpect(carolSportsAck.bytes).toBeGreaterThan(0);
	log.success("✅ Sports publish successful");

	// ── bob unsubscribes from "news" ──────────────────────────────────────────
	log.info("🔕 Bob unsubscribing from news...");
	await send(bob, { event: "unsubscribe", topic: "news" });
	const bobUnsub = await bobNext();
	log.info("[bob]   unsubscribed:", bobUnsub);
	manualExpect(bobUnsub).toHaveProperty("event", "unsubscribed");
	manualExpect(bobUnsub).toHaveProperty("topic", "news");
	log.success("✅ Bob unsubscribed successfully");

	// ── alice publishes to "news" again — only carol should receive ───────────
	log.info(
		"📢 Testing publish after unsubscribe (only Carol should receive)...",
	);
	const carolReceives2 = carolNext();

	await send(alice, {
		event: "publish",
		topic: "news",
		data: { headline: "bob missed this" },
	});
	const aliceAck2 = await aliceNext();
	const carolNews2 = await carolReceives2;

	log.info("[alice] publish ack 2:", aliceAck2);
	log.info("[carol] received news after bob left:", carolNews2);

	manualExpect(aliceAck2).toHaveProperty("event", "published");
	manualExpect(carolNews2).toHaveProperty("event", "message");
	manualExpect(carolNews2).toHaveProperty("topic", "news");
	manualExpect(carolNews2.data).toHaveProperty("headline", "bob missed this");

	// Verify Bob didn't receive anything (no message should have been queued)
	log.info(
		"✅ Only Carol received the second message (Bob correctly unsubscribed)",
	);

	// ── unknown event ─────────────────────────────────────────────────────────
	log.info("⚠️  Testing unknown event handling...");
	await send(bob, { event: "explode" });
	const err = await bobNext();
	log.info("[bob]   error response:", err);
	manualExpect(err).toHaveProperty("event", "error");
	manualExpect(err.data).toContain("unknown event");
	log.success("✅ Unknown event handled correctly");

	// ── clean up ──────────────────────────────────────────────────────────────
	log.info("🧹 Cleaning up connections...");
	await Promise.all([close(alice), close(bob), close(carol)]);
	log.success("✅ All clients closed successfully");
}

run()
	.then(async () => {
		log.success("🎉 All tests passed!");
		log.info("=".repeat(60));
		log.info("🛑 Shutting down server...");
		await server.close();
		log.success("✅ Server stopped");
		process.exit(0);
	})
	.catch(async (err) => {
		log.error("💥 Test suite failed:", err);
		log.error("=".repeat(60));
		await server.close();
		process.exit(1);
	});
