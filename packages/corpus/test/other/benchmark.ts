import { log, logFatal } from "corpus-utils/internalLog";

import { TC } from "../_modules";
import { RouterBenchmark } from "../utils/RouterBenchmark";
import { MemoiristAdapter } from "./MemoiristAdapter";

function main() {
	const adapters = [new MemoiristAdapter(), new TC.BranchAdapter()];
	const results: string[] = [];
	for (const adapter of adapters) {
		const bench = new RouterBenchmark(adapter);
		bench.setup();
		results.push(bench.run());
	}

	log.success(["Finished", ...results].join("\n\n"));
}

// Run the benchmark
try {
	main();
} catch (err) {
	logFatal("Benchmark failed:", err);
}
