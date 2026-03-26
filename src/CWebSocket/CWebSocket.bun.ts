import type { CWebSocketInterface } from "@/CWebSocket/CWebSocketInterface";

export class CWebSocketBun implements CWebSocketInterface {
	constructor(ws: Bun.ServerWebSocket<any>) {
		this.ws = ws;
		this.subscriptions = this.ws.subscriptions;
		this.remoteAddress = this.ws.remoteAddress;
		this.readyState = this.ws.readyState;
	}

	readonly subscriptions: string[];
	readonly remoteAddress: string;
	readonly readyState: 0 | 1 | 2 | 3;

	private readonly ws: Bun.ServerWebSocket;

	send(data: string | ArrayBufferLike): number {
		return this.ws.send(data);
	}

	publish(topic: string, data: string | ArrayBufferLike): number {
		return this.ws.publish(topic, data);
	}

	cork(callback: (ws: CWebSocketInterface) => unknown): unknown {
		return this.ws.cork(callback);
	}

	close(code?: number, reason?: string): void {
		return this.ws.close(code, reason);
	}

	terminate(): void {
		return this.ws.terminate();
	}

	subscribe(topic: string): void {
		return this.ws.subscribe(topic);
	}

	unsubscribe(topic: string): void {
		return this.ws.unsubscribe(topic);
	}

	isSubscribed(topic: string): boolean {
		return this.ws.isSubscribed(topic);
	}
}
