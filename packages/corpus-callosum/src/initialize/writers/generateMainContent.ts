import { toCamelCase } from "../../utils/toCamelCase";
import { toPascalCase } from "../../utils/toPascalCase";

export function generateMainContent(
	modules: string[],
	databaseImportPath: string,
	moduleDirImportPath: string,
) {
	const lines: string[] = [];

	lines.push(
		`import { C, X } from "@ozanarslan/corpus";`,
		`import { DatabaseClient } from "${databaseImportPath}";`,
	);

	for (const mod of modules) {
		const pascal = toPascalCase(mod);
		lines.push(
			`import { ${pascal}Controller } from "${moduleDirImportPath}/${pascal}Controller";`,
			`import { ${pascal}Service } from "${moduleDirImportPath}/${pascal}Service";`,
			`import { ${pascal}Repository } from "${moduleDirImportPath}/${pascal}Repository";`,
		);
	}

	lines.push(
		`const server = new C.Server();`,
		``,
		`const db = new DatabaseClient();`,
		``,
		`new C.Route("/health", () => "ok");`,
		``,
	);

	for (const mod of modules) {
		const camel = toCamelCase(mod);
		const pascal = toPascalCase(mod);
		lines.push(
			`const ${camel}Repository = new ${pascal}Repository(db);`,
			`const ${camel}Service = new ${pascal}Service(${camel}Repository);`,
			`new ${pascal}Controller(${camel}Service);`,
			``,
		);
	}

	lines.push(
		`new X.RateLimiter();`,
		`new X.Cors({`,
		`	allowedOrigins: [X.Config.get("CLIENT_URL")],`,
		`	allowedMethods: ["GET", "POST"],`,
		`	allowedHeaders: ["Content-Type", "Authorization"],`,
		`	credentials: true,`,
		`});`,
		``,
	);

	lines.push(
		`new C.Middleware({`,
		`	useOn: "*",`,
		`	handler: (c) => {`,
		`		console.log(\`[\${c.req.method}] \${c.url.pathname}\`);`,
		`	},`,
		`});`,
		``,
	);

	lines.push(
		`void server.listen(X.Config.get("PORT", { parser: Number, fallback: 3000 }));`,
	);

	return lines.join("\n");
}
