type Log = typeof console & {
	success: (...args: any[]) => void;
	fatal: (...args: any[]) => never;
};

function makeLog(): Log {
	const log = console as Log;
	log.success = (...args: any[]) => console.log("✅", ...args);
	log.fatal = (...args: any[]): never => {
		console.error("💀", ...args);
		process.exit(1);
	};
	return log;
}

export const log = makeLog();

export function logFatal(...args: any[]): never {
	console.error(...args);
	process.exit(1);
}
