import { marked, Renderer } from "marked";

const renderer = new Renderer();

const copyIcon = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1H12C12.5523 1 13 1.44772 13 2V10C13 10.5523 12.5523 11 12 11H6C5.44772 11 5 10.5523 5 10V2C5 1.44772 5.44772 1 6 1Z" stroke="currentColor" stroke-width="1.5"/><path d="M3 5H2C1.44772 5 1 5.44772 1 6V14C1 14.5523 1.44772 15 2 15H8C8.55228 15 9 14.5523 9 14V13" stroke="currentColor" stroke-width="1.5"/></svg>`;

// Escape HTML entities to prevent <...> being parsed as tags
function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

renderer.code = ({ text, lang }) => {
	const escaped = escapeHtml(text);
	if (lang === "sh") {
		return `\t<div class="code-copy">\n\t\t<code>${escaped}</code>\n\t\t<button onclick="(async()=>{try{await navigator.clipboard.writeText(this.previousElementSibling.textContent);this.classList.add('copied');setTimeout(()=>this.classList.remove('copied'),2000)}catch(e){console.error('Failed to copy:',e)}})()" class="copy-btn" aria-label="Copy to clipboard">${copyIcon}</button>\n\t</div>\n`;
	}
	return `\t<pre><code>${escaped}</code></pre>\n`;
};

renderer.heading = ({ text, depth }) => {
	const codeMatch = text.match(/^`(.+)`$/);
	const inner = codeMatch ? `<code>${codeMatch[1]}</code>` : text;

	if (depth === 2) {
		const id = text
			.replace(/`/g, "")
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		return `<h2 id="${id}">${inner}</h2>\n`;
	}

	return `<h${depth}>${inner}</h${depth}>\n`;
};

marked.use({ renderer });

export async function convertMD(input: string): Promise<string> {
	const html = await marked(input);
	return `<main>\n${html}</main>`;
}
