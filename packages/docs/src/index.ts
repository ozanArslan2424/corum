import { C, X } from "@ozanarslan/corpus";

import { compile } from "@/compiler/compile";

const outDir = `${X.Config.cwd()}/public`;

await compile(outDir);

const server = new C.Server();

new C.BundleRoute("/*", outDir);

await server.listen(3000);
