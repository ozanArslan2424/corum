import hljs from "highlight.js";

export class HtmlHelper {
	escapeHtml(code: string): string {
		return code
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	unescapeHtml(code: string): string {
		return code
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&amp;/g, "&")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'");
	}

	highlightCode(html: string) {
		const codeRegex = /<pre><code>([\s\S]*?)<\/code><\/pre>/gi;

		return html.replace(codeRegex, (match, code) => {
			const language = "typescript";
			try {
				const highlighted = hljs.highlight(this.unescapeHtml(code), { language }).value;
				return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
			} catch (err) {
				console.warn("hljs fail:", err);
				return match;
			}
		});
	}

	hydrate(target: string, entries: Record<string, string>) {
		let result = target;
		for (const [key, content] of Object.entries(entries)) {
			const regex = new RegExp(`<!--\\s*INSERT\\s*==\\s*${key}\\s*-->`);
			result = result.replace(regex, content);
		}
		return result;
	}

	countHeaders(html: string) {
		let h2Count = 0;
		let h3Count = 0;
		let h4Count = 0;
		return html.replace(/<h([234])([^>]*)>/g, (_match, level: string, attrs: string) => {
			let counter = "";
			if (level === "2") {
				h2Count++;
				h3Count = 0;
				h4Count = 0;
				counter = `${h2Count}`;
			} else if (level === "3") {
				h3Count++;
				h4Count = 0;
				counter = `${h2Count}.${h3Count}`;
			} else if (level === "4") {
				h4Count++;
				counter = `${h2Count}.${h3Count}.${h4Count}`;
			}
			return `<h${level}${attrs} data-counter="${counter}">`;
		});
	}
}
