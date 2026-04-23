import ts from "typescript";

export function hoistFunctionBody(source: string): string {
	const sourceFile = ts.createSourceFile(
		"temp.ts",
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);

	let targetFunc: ts.FunctionDeclaration | undefined;

	function findListen(node: ts.Node): boolean {
		if (
			ts.isCallExpression(node) &&
			ts.isPropertyAccessExpression(node.expression) &&
			node.expression.name.text === "listen"
		) {
			return true;
		}
		return ts.forEachChild(node, findListen) ?? false;
	}

	function findFunc(node: ts.Node) {
		if (ts.isFunctionDeclaration(node) && findListen(node)) {
			targetFunc ??= node;
			return;
		}
		ts.forEachChild(node, findFunc);
	}

	findFunc(sourceFile);

	if (!targetFunc?.body) return source;

	const funcName = targetFunc.name?.text;
	const printer = ts.createPrinter();
	const hoisted = targetFunc.body.statements
		.map((stmt) => printer.printNode(ts.EmitHint.Unspecified, stmt, sourceFile))
		.join("\n");

	const before = source.slice(0, targetFunc.getStart(sourceFile));
	const after = source.slice(targetFunc.getEnd());
	let result = before + hoisted + after;

	// remove the call site too
	if (funcName) {
		result = result.replace(
			new RegExp(`^\\s*(?:void|await)?\\s*${funcName}\\s*\\(.*?\\);.*$`, "m"),
			"",
		);
	}

	return result;
}
