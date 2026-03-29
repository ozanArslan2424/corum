import { C, X } from "@/index";
import { createTestServer } from "../utils/createTestServer";
import { TEST_PORT } from "../utils/req";
import { log } from "@/utils/internalLogger";
import { createClient } from "redis";

const server = createTestServer();

const redis = createClient({ url: "redis://localhost:6379" });
await redis.connect();

new X.RateLimiter({
	storeType: "redis",
	store: new X.RateLimiterRedisStore(redis),
});

new C.WebSocketRoute("/ws", {
	onOpen: (ws) => {
		ws.send(
			JSON.stringify({
				event: "connected",
				data: { remoteAddress: ws.remoteAddress },
			}),
		);
	},

	onClose: (_ws, code, reason) => {
		log.log(`[ws] closed — code=${code} reason=${reason}`);
	},

	onMessage: (ws, message) => {
		const msg = JSON.parse(message as string) as {
			event: string;
			topic?: string;
			data?: unknown;
		};

		switch (msg.event) {
			case "subscribe": {
				ws.subscribe(msg.topic!);
				ws.send(JSON.stringify({ event: "subscribed", topic: msg.topic }));
				break;
			}
			case "unsubscribe": {
				ws.unsubscribe(msg.topic!);
				ws.send(JSON.stringify({ event: "unsubscribed", topic: msg.topic }));
				break;
			}
			case "publish": {
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
				break;
			}
			case "ping": {
				ws.send(JSON.stringify({ event: "pong", data: msg.data }));
				break;
			}
			case "subscriptions": {
				ws.send(
					JSON.stringify({ event: "subscriptions", data: ws.subscriptions }),
				);
				break;
			}
			default: {
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

void server.listen(TEST_PORT);
