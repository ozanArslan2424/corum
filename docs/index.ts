import { C, X } from "../dist";
import { convertMD } from "./convert-md";

const server = new C.Server();

const fileCache = new X.CacheMap(async (path) => {
	const file = new X.File(path);
	return await file.text();
});

const pageCache = new X.CacheMap(async (page) => {
	const md = new X.File(addr("markdown", `${page}.md`));
	if (await md.exists()) {
		const markdown = await md.text();
		return await convertMD(markdown);
	} else {
		const html = new X.File(addr("html", `${page}.html`));
		return await html.text();
	}
});

function addr(...path: string[]) {
	return X.Config.resolvePath(X.Config.cwd(), "docs", ...path);
}

function insert(target: string, entries: Record<string, string>) {
	let result = target;
	for (const [key, content] of Object.entries(entries)) {
		const regex = new RegExp(`<!--\\s*INSERT\\s*==\\s*${key}\\s*-->`);
		result = result.replace(regex, content);
	}
	return result;
}

const topbar = await fileCache.get(addr("html", "header.html"));
const sidebar = await fileCache.get(addr("html", "sidebar.html"));
const index = await fileCache.get(addr("html", "index.html"));

new C.Route<unknown, unknown, { file: string }>("/styles/:file", (c) =>
	C.Response.streamFile(addr("css", c.params.file)),
);

new C.StaticRoute("/", addr("html", "layout.html"), async (_, layout) =>
	insert(layout, { topbar, sidebar, content: index }),
);

new C.StaticRoute<unknown, unknown, { page: string }>(
	"/docs/:page",
	addr("html", "layout.html"),
	async (c, layout) =>
		insert(layout, {
			topbar,
			sidebar,
			content: await pageCache.get(c.params.page),
		}),
);

server.setOnBeforeListen(() => {
	console.log(server.routes.map((r) => r.id).join("\n"));
});

await server.listen(3000);
