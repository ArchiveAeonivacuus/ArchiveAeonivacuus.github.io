import getReadingTime from "reading-time";
import sanitizeHtml from "sanitize-html";

type RenderedPost = {
	remarkPluginFrontmatter?: {
		words?: number;
		minutes?: number;
		excerpt?: string;
	};
	compiledContent?: () => string | Promise<string>;
};

export async function getPostRenderInfo(rendered: RenderedPost, rawBody = "") {
	const existing = rendered.remarkPluginFrontmatter;
	if (
		typeof existing?.words === "number" &&
		typeof existing?.minutes === "number" &&
		typeof existing?.excerpt === "string"
	) {
		return existing;
	}

	const html = rendered.compiledContent
		? await rendered.compiledContent()
		: "";
	const plainHtml = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
		.replace(/\s+/g, " ")
		.trim();
	const typstText = rawBody
		.replace(/^#import.*$/gm, "")
		.replace(/^#metadata\(\([\s\S]*?\)\)\s*<frontmatter>\s*/m, "")
		.replace(/```[\s\S]*?```/g, "")
		.replace(/#(?:\w[\w-]*)(?:\([^)]*\))?\[/g, "")
		.replace(/#(?:\w[\w-]*)(?:\([^)]*\))?/g, "")
		.replace(/[\[\]{}$=*_`<>]/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	const text = plainHtml || typstText;
	const reading = getReadingTime(text);
	const paragraph = html.match(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/i)?.[1] ?? "";
	const typstExcerpt = typstText
		.split(/\n\s*\n/)
		.find((part) => part.trim() && !part.trim().startsWith("#")) ?? "";
	const excerpt = sanitizeHtml(paragraph, {
		allowedTags: [
			"span",
			"ruby",
			"rt",
			"rp",
			"b",
			"i",
			"em",
			"strong",
			"a",
			"code",
			"abbr",
			"sub",
			"sup",
		],
		allowedAttributes: {
			span: ["class"],
			ruby: ["class"],
			rt: ["class"],
			a: ["href", "title", "target", "rel"],
			code: ["class"],
		},
		allowedSchemes: ["http", "https", "mailto"],
	}) || sanitizeHtml(typstExcerpt)
		.replace(/\s+/g, " ")
		.trim();

	return {
		words: reading.words,
		minutes: Math.max(1, Math.round(reading.minutes)),
		excerpt,
	};
}
