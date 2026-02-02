export interface __Coreum_DBClientInterface {
	connect(): Promise<void>;
	disconnect(): Promise<void>;
}
