// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";
import sanitizeHtml from "sanitize-html";

/* Use the post's first paragraph as the excerpt */
export function remarkExcerpt() {
	return (tree, { data }) => {
		let excerpt = "";
		for (const node of tree.children) {
			if (node.type !== "paragraph") {
				continue;
			}
			// convert node to string then sanitize while allowing harmless
			// presentational tags such as <span>, <ruby>, <rt> so the
			// homepage can render intended typography (e.g. font-family)
			excerpt = toString(node);
			excerpt = sanitizeHtml(excerpt, {
				allowedTags: [
					"span",
					"ruby",
					"rt",
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
				// only allow common safe URL schemes for links
				allowedSchemes: ["http", "https", "mailto"],
			});
			// normalize whitespace
			excerpt = excerpt.replace(/\s+/g, " ").trim();
			break;
		}
		data.astro.frontmatter.excerpt = excerpt;
	};
}
