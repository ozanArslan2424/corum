export type __Coreum_InferSchema<T> = T extends { infer: infer U }
	? U // For ArkType-like schemas
	: T extends { _type: infer U }
		? U // For other libraries
		: T extends { parse: (input: any) => infer U }
			? U // For parsers
			: T extends { _output: infer U }
				? U // For Zod-like
				: never;
