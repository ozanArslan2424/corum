import fs from "node:fs";

import prettier from "prettier";

import type { BaseWriterTypes as B } from "./BaseWriterTypes";
import type { ClassWriterTypes as CWT } from "./ClassWriterTypes";
import type { FunctionWriterTypes as FWT } from "./FunctionWriterTypes";
import type { InterfaceWriterTypes as IWT } from "./InterfaceWriterTypes";
import type { StatementWriterTypes as SWT } from "./StatementWriterTypes";
import type { VariableWriterTypes as VWT } from "./VariableWriterTypes";

export class Writer {
	constructor(indentOrFilePath?: number | string) {
		if (typeof indentOrFilePath === "string") {
			this.writeToFilePath = indentOrFilePath;
			fs.writeFileSync(indentOrFilePath, "");
		} else {
			this.indent = indentOrFilePath ?? 0;
		}
	}

	readonly indent: number = 0;
	private readonly writeToFilePath?: string;

	private fileLineCount = 0;
	private O: string[] = [];
	variables: Set<string> = new Set();
	interfaces: Set<string> = new Set();
	tabChar = "\t";

	read(join: string = "\n") {
		return this.O.join(join);
	}

	async format(parser: string) {
		const formatted = await prettier.format(this.read(), { parser });
		this.O = [];
		this.O.push(formatted);
		if (this.writeToFilePath) {
			fs.writeFileSync(this.writeToFilePath, formatted);
		}
		return formatted;
	}

	raw(...strings: string[]) {
		this.O.push(...strings);
		if (this.writeToFilePath) {
			fs.appendFileSync(this.writeToFilePath, strings.join("\n") + "\n");
			this.fileLineCount += strings.length;
		}
	}

	line(...strings: string[]) {
		const tabs = new Array(this.indent).fill(this.tabChar).join("");
		const tabbed = strings.map((str) => `${tabs}${str}`);
		this.O.push(...tabbed);
		if (this.writeToFilePath) {
			fs.appendFileSync(this.writeToFilePath, tabbed.join("\n") + "\n");
			this.fileLineCount += tabbed.length;
		}
	}

	inline(...strings: string[]) {
		if (this.O.length === 0) this.O.push("");
		this.O[this.O.length - 1] += strings.join("");
		if (this.writeToFilePath) {
			fs.writeFileSync(this.writeToFilePath, this.O.join("\n") + "\n");
		}
	}

	pair(k: string, v?: string) {
		this.line(v ? `${k}: ${v},` : `${k},`);
	}

	tab(str: string, indent: number = 1) {
		const tabs = new Array(this.indent + indent).fill(this.tabChar).join("");
		this.line(`${tabs}${str}`);
	}

	untab(str: string, indent: number = 1) {
		const tabs = new Array(Math.max(0, this.indent - indent)).fill(this.tabChar).join("");
		this.O.push(`${tabs}${str}`);
		if (this.writeToFilePath) {
			fs.appendFileSync(this.writeToFilePath, `${tabs}${str}\n`);
			this.fileLineCount += 1;
		}
	}

	writeBody(self: Writer, bodyWriter: B.BodyWriter, addIndent: number = 1) {
		const w = new Writer(self.indent + addIndent);
		bodyWriter(w);
		self.raw(w.read());
	}

	scope(body: B.BodyWriter): B.BodyWriter {
		return (w) => {
			w.inline("{");
			body(w);
			w.untab("}");
		};
	}

	str(s: string): string {
		return `"${s}"`;
	}

	$class(o: CWT.Class) {
		this.variables.add(o.name);

		this.line(
			`${o.isExported ? `export ` : ``}${o.isAbstract ? `abstract ` : ``}class ${o.name} ${o.extends ? `extends ${o.extends} ` : ``} ${o.implements ? `implements ${o.implements} ` : ``}{`,
		);

		if (o.constr) {
			this.$constructor(o.constr);
		}

		this.writeBody(this, o.body);

		this.line(`}`);
	}

	$constructor(o: CWT.Constructor) {
		this.tab(
			`constructor(${o.args ? o.args.map((a) => `${a.keyword ? `${a.keyword} ` : ``}${a.key}: ${a.type}`).join(", ") : ``}) {`,
		);

		if (!o.superArgs && !o.body) {
			this.inline("}");
			this.line("");
			return;
		}

		if (o.superArgs) {
			this.tab(`super(${o.superArgs})`, 1);
		}

		if (o.body) {
			this.writeBody(this, o.body);
		}

		this.tab("}");
		this.line("");
	}

	$method(o: CWT.Method) {
		this.line(o.keyword ? `${o.keyword} ` : "");
		this.inline(
			o.isAsync ? "async " : "",
			o.name,
			o.generics ? `<${o.generics.join(", ")}>` : " ",
			`(${o.args ? o.args.join(", ") : ""})`,
			o.type ? `: ${o.type}` : " ",
			"{",
		);
		this.writeBody(this, o.body);
		this.line("};");
		this.line("");
	}

	$abstractMethod(o: CWT.AbstractMethod) {
		this.line("abstract ");
		this.inline(
			o.keyword ? `${o.keyword} ` : "",
			o.isAsync ? "async " : "",
			o.name,
			o.generics ? ` <${o.generics.join(", ")}>` : " ",
			`(${o.args ? o.args.join(", ") : ""})`,
			o.type ? `: ${o.type}` : " ",
			";",
		);
		this.line("");
	}

	$arrowMethod(o: CWT.ArrowMethod) {
		this.line(o.keyword ? `${o.keyword} ` : "");
		this.inline(
			o.name,
			o.type ? `: ${o.type}` : "",
			" = ",
			o.isAsync ? "async " : "",
			o.generics ? ` <${o.generics.join(", ")}>` : "",
			"(",
			o.args ? o.args.join(", ") : "",
			") => {",
		);
		this.writeBody(this, o.body);
		this.line("};");
		this.line("");
	}

	$member(o: CWT.Member): void {
		let value: string;
		if (typeof o.value === "string") {
			value = o.value;
		} else {
			const w = new Writer(this.indent + 1);
			o.value(w);
			value = w.read();
		}
		this.line(
			`${o.keyword ? `${o.keyword} ` : ""}${o.name}${o.type ? `:${o.type}` : ``} = ${value};`,
		);
	}

	$function(o: FWT.Function) {
		this.variables.add(o.name);
		this.line(`${o.isAsync ? `async ` : ``}function `);
		this.inline(
			o.name,
			o.generics ? `<${o.generics.join(", ")}>` : "",
			"(",
			o.args ? o.args.join(", ") : "",
			")",
			o.type ? `: ${o.type} ` : " ",
			"{",
		);
		this.writeBody(this, o.body);
		this.line("};");
		this.line("");
	}

	$arrow(o: FWT.Arrow) {
		this.variables.add(o.name);
		this.line(`${o.keyword ?? "const"} `);
		this.inline(
			o.name,
			o.type ? `: ${o.type}` : "",
			" = ",
			o.isAsync ? "async " : "",
			o.generics ? `<${o.generics.join(", ")}>` : "",
			"(",
			o.args ? o.args.join(", ") : "",
			") => {",
		);
		this.writeBody(this, o.body);
		this.line("};");
		this.line("");
	}

	$interface(o: IWT.Interface) {
		this.interfaces.add(o.name);
		this.line(`${o.isExported ? "export " : ""}${o.keyword ?? "interface"} `);
		this.inline(
			o.name,
			o.generics ? `<${o.generics.join(", ")}> ` : " ",
			o.keyword === "type" ? "= {" : "{",
		);
		this.writeBody(this, o.body);
		this.line("}");
		this.line("");
	}

	$namespace(o: VWT.Namespace) {
		this.line(`${o.isExported ? "export " : ""}namespace ${o.name} {`);

		const w = new Writer(this.indent + 1);
		o.body(w);
		this.raw(w.read());

		this.line("}");
		this.line("");
		const onlyTypes = w.variables.size === 0;
		if (onlyTypes) {
			this.interfaces.add(o.name);
		} else {
			this.variables.add(o.name);
		}
	}

	$if(...conditions: SWT.Condition[]): SWT.If {
		return {
			then: (body) => {
				const conditionStr = conditions.join(" ");
				this.line(`if (${conditionStr}) {`);
				this.writeBody(this, body);
				this.line(`}`);

				return {
					elseif: (...newConditions) => {
						return {
							then: (newBody) => {
								const conditionStr2 = newConditions.join(" ");
								this.line(`else if (${conditionStr2}) {`);
								this.writeBody(this, newBody);
								this.line(`}`);

								return {
									// not the class this, this this
									elseif(...newConditions2) {
										return this.elseif(...newConditions2);
									},
									else: (finalBody) => {
										this.line(`else {`);
										this.writeBody(this, finalBody);
										this.line(`}`);
									},
								};
							},
						};
					},
					else: (finalBody) => {
						this.line(`else {`);
						this.writeBody(this, finalBody);
						this.line(`}`);
					},
				};
			},
		};
	}

	$for(paran: SWT.ForParan[], body: B.BodyWriter) {
		this.line(`for (${paran.join(" ")}) {`);
		this.writeBody(this, body);
		this.line(`}`);
	}

	$switch(expr: string, ...cases: SWT.SwitchCase[]): void {
		this.line(`switch (${expr}) {`);
		for (const c of cases) {
			if (c.condition === "default") {
				this.tab(`default: {`, 1);
			} else {
				this.tab(`case ${c.condition}: {`, 1);
			}
			this.writeBody(this, c.body);
			if (c.break !== false) this.tab(`break;`, 2);
			this.tab(`}`, 1);
		}
		this.line(`}`);
	}

	$tryCatch(o: SWT.TryCatch): void {
		this.line(`try {`);
		this.writeBody(this, o.try);
		this.line(`}`);

		if (o.catch) {
			this.line(`catch (${o.catch.arg ?? `e`}) {`);
			this.writeBody(this, o.catch.body);
			this.line(`}`);
		}

		if (o.finally) {
			this.line(`finally {`);
			this.writeBody(this, o.finally);
			this.line(`}`);
		}
	}

	$return(body: B.BodyWriter | string): void {
		if (typeof body === "string") {
			this.line(`return${body.length === 0 ? "" : ` ${body}`};`);
			return;
		} else {
			this.line("return {");
			this.writeBody(this, body);
			this.line("};");
		}
	}

	$throw(o: SWT.Throw): void {
		this.line(`throw new ${o.errorType ?? `Error`}(${o.args});`);
	}

	$comment(o: SWT.Comment): void {
		if (typeof o === "string") {
			this.line(`// ${o}`);
			return;
		}

		switch (o.variant) {
			case "line":
				this.line(`// ${o.text}`);
				break;
			case "block":
				this.line(`/*`);
				for (const line of o.lines) this.line(` * ${line}`);
				this.line(` */`);
				break;
			case "jsdoc":
				this.line(`/**`);
				for (const line of o.lines) this.line(` * ${line}`);
				this.line(` */`);
				break;
		}
	}

	$import(o: SWT.Import) {
		this.line("import ");
		this.inline(o.isType ? "type " : "", o.def ?? "");

		if (o.keys) {
			if (o.def) {
				this.inline(", ");
			}

			this.inline("{ ");

			for (const [i, k] of o.keys.entries()) {
				if (typeof k === "string") {
					this.inline(k);
				} else if (k.as) {
					this.inline(k.isType ? "type " : "", k.key, " as ", k.as);
				} else {
					this.inline(k.isType ? "type " : "", k.key);
				}
				if (i !== o.keys.length - 1) {
					this.inline(", ");
				}
			}

			this.inline(" }");
		}

		this.inline(` from "${o.from}";`);
	}

	$export(o: SWT.Export): void {
		switch (o.variant) {
			case "type":
				this.line(`export type { ${o.keys.join(", ")} };`);
				break;
			case "obj":
				this.line(`export { ${o.keys.join(", ")} };`);
				break;
			case "named":
				this.line(`export const ${o.name} = { ${o.keys.join(", ")} };`);
				break;
			case "default":
				this.line(`export default ${o.keys.length > 1 ? `{ ${o.keys.join(", ")} }` : o.keys[0]};`);
				break;
			case "reexport":
				this.line(`export { ${o.keys.join(", ")} } from "${o.from}";`);
				break;
			case "reexportStar":
				this.line(`export * from "${o.from}";`);
				break;
		}
	}

	private resolveValue(value: string | B.BodyWriter) {
		if (typeof value === "string") {
			return value;
		} else {
			const w = new Writer(this.indent + 1);
			value(w);
			return w.read();
		}
	}

	$const(o: VWT.Const): void {
		this.variables.add(o.name);
		this.line(
			`${o.isExported ? "export " : ""}const ${o.name}${o.type ? `:${o.type}` : ``} = ${this.resolveValue(o.value)};`,
		);
	}

	$var(o: VWT.Var): void {
		this.variables.add(o.name);
		this.line(
			`${o.isExported ? "export " : ""}var ${o.name}${o.type ? `:${o.type}` : ``} = ${this.resolveValue(o.value)};`,
		);
	}

	$let(o: VWT.Let): void {
		this.variables.add(o.name);
		this.line(
			`${o.isExported ? "export " : ""}let ${o.name}${o.type ? `:${o.type}` : ``} = ${this.resolveValue(o.value)};`,
		);
	}

	$type(o: VWT.Type): void {
		this.interfaces.add(o.name);
		this.line(
			`${o.isExported ? "export " : ""}type ${o.name}${o.generics ? `<${o.generics.join(", ")}>` : ""} = ${this.resolveValue(o.value)};`,
		);
	}
}
