import { toHtml } from "hast-util-to-html";
import { visit } from "unist-util-visit";
import sanitizeHtml from "sanitize-html";

/*
 * 在 rehype 阶段（行内指令 :ong[]、:ja[] 等和 ruby 已渲染成 HTML）
 * 提取第一个 <p> 的内容作为 excerpt，这样首页缩略也能保留字体样式。
 */
export function rehypeExcerpt() {
	return (tree, file) => {
		let excerpt = "";
		visit(tree, "element", (node) => {
			if (excerpt !== "") return;
			if (node.tagName === "p") {
				excerpt = node.children.map((child) => toHtml(child)).join("");
			}
		});
		if (excerpt) {
			excerpt = sanitizeHtml(excerpt, {
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
					span: ["style", "class"],
					ruby: ["style", "class"],
					rt: ["style", "class"],
					a: ["href", "title", "target", "rel"],
					code: ["class"],
				},
				allowedSchemes: ["http", "https", "mailto"],
			});
			excerpt = excerpt.replace(/\s+/g, " ").trim();
		}
		file.data.astro.frontmatter.excerpt = excerpt;
	};
}
