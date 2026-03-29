import { log } from "@/utils/internalLogger";
import { RouterBenchmark } from "./RouterBenchmark";
import { MemoiristAdapter, BranchAdapter } from "@/index";

async function main() {
	const adapters = [new MemoiristAdapter(), new BranchAdapter()];
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
	log.fatal("Benchmark failed:", error);
});
