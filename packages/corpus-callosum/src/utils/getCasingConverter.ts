import { toCamelCase } from "./toCamelCase";
import { toPascalCase } from "./toPascalCase";

export function getCasingConverter(casing: string): (s: string) => string {
	switch (casing) {
		case "pascal":
		default:
			return toPascalCase;
		case "camel":
			return toCamelCase;
		case "kebab":
			return toCamelCase;
	}
}
