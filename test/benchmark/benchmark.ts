import { log, logFatal } from "@/Utils/log";
import { RouterBenchmark } from "./RouterBenchmark";
import { TC } from "../_modules";

async function main() {
	const adapters = [new TC.MemoiristAdapter(), new TC.BranchAdapter()];
	const results: string[] = [];
	for (const adapter of adapters) {
		const bench = new RouterBenchmark(adapter);
		bench.setup();
		results.push(await bench.run());
	}

	log.success(["Finished", ...results].join("\n\n"));
}

// Run the benchmark
main().catch((error) => {
	logFatal("Benchmark failed:", error);
});
