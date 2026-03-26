import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";
import type WebSocket from "ws";

type PubSubRegistry = Map<string, Set<CWebSocketNode>>;

export class CWebSocketNode implements CWebSocketInterface {
	readonly remoteAddress: string;
	readonly readyState: 0 | 1 | 2 | 3;
	readonly subscriptions: string[] = [];

	private readonly ws: WebSocket;
	private readonly registry: PubSubRegistry;

	constructor(ws: WebSocket, registry: PubSubRegistry, remoteAddress: string) {
		this.ws = ws;
		this.registry = registry;
		this.remoteAddress = remoteAddress;
		this.readyState = ws.readyState as 0 | 1 | 2 | 3;
	}

	send(data: string | ArrayBufferLike): number {
		this.ws.send(data);
		return 0;
	}

	publish(topic: string, data: string | ArrayBufferLike): number {
		const subscribers = this.registry.get(topic);
		if (!subscribers) return 0;
		let count = 0;
		for (const sub of subscribers) {
			if (sub !== this && sub.readyState === 1) {
				sub.send(data);
				count++;
			}
		}
		return count;
	}

	cork(callback: (ws: CWebSocketInterface) => unknown): unknown {
		return callback(this);
	}

	close(code?: number, reason?: string): void {
		this.ws.close(code, reason);
	}

	terminate(): void {
		this.ws.terminate();
	}

	subscribe(topic: string): void {
		if (this.isSubscribed(topic)) return;
		this.subscriptions.push(topic);
		const set = this.registry.get(topic) ?? new Set();
		set.add(this);
		this.registry.set(topic, set);
	}

	unsubscribe(topic: string): void {
		const idx = this.subscriptions.indexOf(topic);
		if (idx === -1) return;
		this.subscriptions.splice(idx, 1);
		this.registry.get(topic)?.delete(this);
	}

	isSubscribed(topic: string): boolean {
		return this.subscriptions.includes(topic);
	}

	/** Call on socket close to clean up all topic registrations. */
	cleanup(): void {
		for (const topic of this.subscriptions) {
			this.unsubscribe(topic);
		}
	}
}
