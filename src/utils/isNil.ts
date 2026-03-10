export function isNil<T>(input: T): input is Extract<T, null | undefined> {
	return input === null || input === undefined;
}
