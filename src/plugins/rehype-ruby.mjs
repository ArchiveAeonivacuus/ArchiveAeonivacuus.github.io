import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";

const SKIP_TAGS = new Set(["code", "pre", "script", "style", "ruby", "rt"]);

// 注音是行内元素，跨到这些块级元素就说明写法有问题，直接放弃
const BLOCK_TAGS = new Set([
	"address",
	"article",
	"aside",
	"blockquote",
	"br",
	"details",
	"dialog",
	"div",
	"dl",
	"dt",
	"dd",
	"fieldset",
	"figcaption",
	"figure",
	"footer",
	"form",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"header",
	"hr",
	"li",
	"main",
	"nav",
	"ol",
	"p",
	"section",
	"summary",
	"table",
	"tbody",
	"td",
	"tfoot",
	"th",
	"thead",
	"tr",
	"ul",
]);

/**
 * 从 children[startIndex] 开始尝试消费一组 `{基字|注音}`。
 * 基字/注音里允许出现行内元素（例如 :ong[…] 展开出的 <span>）。
 * 成功返回 { nodes, consumed }，否则返回 null。
 */
function tryConsumeRuby(children, startIndex) {
	const first = children[startIndex];
	const open = first.value.indexOf("{");
	if (open < 0) return null;
	const prefix = first.value.slice(0, open);

	const baseNodes = [];
	const rtNodes = [];
	let mode = "base";
	let buffer = "";
	const flush = () => {
		if (buffer) {
			(mode === "base" ? baseNodes : rtNodes).push({
				type: "text",
				value: buffer,
			});
			buffer = "";
		}
	};

	let i = startIndex;
	let offset = open + 1;
	let trailing = "";
	let closed = false;

	while (i < children.length) {
		const node = children[i];
		if (node.type === "text") {
			const value = node.value;
			let k = offset;
			for (; k < value.length; k++) {
				const ch = value[k];
				if (ch === "\n" || ch === "{") return null;
				if (ch === "|" && mode === "base") {
					flush();
					mode = "rt";
				} else if (ch === "}") {
					flush();
					trailing = value.slice(k + 1);
					closed = true;
					break;
				} else {
					buffer += ch;
				}
			}
			if (closed) {
				i++;
				break;
			}
			offset = 0;
		} else if (node.type === "element") {
			if (BLOCK_TAGS.has(node.tagName)) return null;
			flush();
			(mode === "base" ? baseNodes : rtNodes).push(node);
		} else {
			return null;
		}
		i++;
	}

	if (!closed) return null;
	if (baseNodes.length === 0 || rtNodes.length === 0) return null;

	const nodes = [];
	if (prefix) nodes.push({ type: "text", value: prefix });
	nodes.push(h("ruby", [...baseNodes, h("rt", rtNodes)]));
	if (trailing) nodes.push({ type: "text", value: trailing });

	return { nodes, consumed: i - startIndex };
}

function processChildren(parent) {
	const children = parent.children;
	if (!children) return;
	let i = 0;
	while (i < children.length) {
		const node = children[i];
		if (node.type === "text" && node.value.includes("{")) {
			const consumed = tryConsumeRuby(children, i);
			if (consumed) {
				children.splice(i, consumed.consumed, ...consumed.nodes);
				const last = consumed.nodes[consumed.nodes.length - 1];
				// 尾随文本里可能还有下一组 {…}，原地重新处理
				if (last && last.type === "text") continue;
				i += consumed.nodes.length;
				continue;
			}
		}
		i++;
	}
}

/**
 * 把 `{汉字|zhě}` 转成 `<ruby>汉字<rt>zhě</rt></ruby>`。
 * 基字与注音都可以包含行内元素，因此下面两种写法都支持：
 *   :ong[{赭|zhě}]   （字体在外）
 *   {赭|:ong[zhě]}   （字体在内）
 * 跳过 code/pre/script/style 以及已存在的 ruby/rt。
 */
export function rehypeRuby() {
	return (tree) => {
		processChildren(tree);
		visit(tree, "element", (node) => {
			if (SKIP_TAGS.has(node.tagName)) return SKIP;
			processChildren(node);
		});
	};
}
