export const ACCEPTED_VALIDATION_LIBS = ["zod", "arktype", "yup"] as const;

export type ValidationLib = (typeof ACCEPTED_VALIDATION_LIBS)[number] | null;
