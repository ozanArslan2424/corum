import type { EnvInterface } from "@/internal/modules/Config/EnvInterface";

export type ConfigEnvKey = keyof EnvInterface | (string & {});
