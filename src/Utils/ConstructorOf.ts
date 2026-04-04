type _Default = typeof _Default;
declare const _Default: unique symbol;

export type ConstructorOf<
	A extends abstract new (...args: any) => any,
	I = _Default,
> = {
	new (
		...args: ConstructorParameters<A>
	): I extends _Default ? InstanceType<A> : I;
};
