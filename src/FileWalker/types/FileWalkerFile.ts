export type FileWalkerFile = {
	name: string;
	extension: string;
	mimeType: string;
	text(): Promise<string>;
	stream(): ReadableStream;
};
