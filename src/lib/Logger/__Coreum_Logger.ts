export interface __Coreum_LoggerInterface {
	error: (...args: any[]) => void;
	warn: (...args: any[]) => void;
	log: (...args: any[]) => void;
	debug: (...args: any[]) => void;
}
