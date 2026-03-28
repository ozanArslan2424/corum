import { log } from "@/utils/internalLogger";
import { RouterBenchmark } from "./RouterBenchmark";
import { MemoiristAdapter } from "@/Router/adapters/MemoiristAdapter";
import { BranchAdapter } from "@/Router/adapters/BranchAdapter";

async function main() {
	const adapters = [MemoiristAdapter, BranchAdapter];
	const results: string[] = [];
	for (const adapter of adapters) {
		const bench = new RouterBenchmark(new adapter());
		bench.setup();
		results.push(await bench.run());
	}

	log.success(["Finished", ...results].join("\n\n"));
}

// Run the benchmark
main().catch((error) => {
	log.fatal("Benchmark failed:", error);
});
