export const toKebabCase = (s: string) =>
	s.charAt(0).toLowerCase() +
	s
		.slice(1)
		.replace(/([A-Z])/g, "-$1")
		.toLowerCase();
