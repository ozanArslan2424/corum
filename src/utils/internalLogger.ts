type Log = typeof console & {
	success: (...args: any[]) => void;
	fatal: (...args: any[]) => never;
};

function makeLog(): Log {
	const log = console as Log;
	log.warn = (...args: any[]) =>
		console.log("\x1b[33m" + args[0], ...args.slice(1), "\x1b[0m");
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
