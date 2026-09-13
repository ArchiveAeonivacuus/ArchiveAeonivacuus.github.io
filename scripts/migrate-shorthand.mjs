/**
 * 一次性迁移脚本：把旧的冗长写法换成新的简写。
 *
 *   1. <ruby>赭<rt>zhě</rt></ruby>            -> {赭|zhě}
 *   2. <span style="font-family: '…'">文本</span> -> :jp[文本] / :ong[文本] / …
 *   3. 文章内与全局定义重复的 .shi/.ci/.poet/.spellcard/.waka 规则会被删除
 *
 * 关键点：Markdown 的原始 HTML 区块（<!-- -->、<table>、独占一行的 <span> 等）
 * 内部不会解析 Markdown，因此那里不能写 {…} 或 :dir[…]。脚本会识别这些区块：
 *   - 区块内：保留 <ruby>，字体标签改写成 <span class="ff-…">
 *   - 区块外：ruby 写成 {…}，字体 span 写成 :dir[…]
 *
 * 用法：
 *   pnpm migrate            # 实际写入
 *   pnpm migrate --dry-run  # 只报告不写入
 */

import fs from "node:fs";
import path from "node:path";

const POSTS_DIR = "./src/content/posts";
const DRY_RUN = process.argv.includes("--dry-run");

// ---------------------------------------------------------------- ruby
const RUBY_RE = /<ruby>([^<>\n]+)<rt>([^<>\n]+)<\/rt><\/ruby>/g;

function migrateRuby(text) {
	let count = 0;
	const out = text.replace(RUBY_RE, (full, base, rt) => {
		if (base.trim() === "" || rt.trim() === "") return full;
		if (/[{}|]/.test(base) || /[{}|]/.test(rt)) return full;
		count++;
		return `{${base}|${rt}}`;
	});
	return { text: out, count };
}

// ------------------------------------------------------------ font span
const FAMILY_TO_DIRECTIVE = {
	sourcehanserifjp: "jp",
	asebimincho: "asebi",
	oldenglishonglisch: "ong",
	sourcehanserifold: "olds",
	"dfkai-sb": "dfkai",
	timesnewroman: "ipa",
	hightowertext: "ht",
	kaiti: "kai",
	msmincho: "msmincho",
};

const FAMILY_TO_CLASS = {
	sourcehanserifjp: "ff-jp",
	asebimincho: "ff-asebi",
	oldenglishonglisch: "ff-ong",
	sourcehanserifold: "ff-olds",
	"dfkai-sb": "ff-dfkai",
	timesnewroman: "ff-ipa",
	hightowertext: "ff-ht",
	kaiti: "ff-kai",
	msmincho: "ff-msmincho",
};

const SPAN_RE = /<span style=(["'])(.*?)\1>([^<>\n]*)<\/span>/g;

function normalize(value) {
	return value
		.toLowerCase()
		.replace(/["']/g, "")
		.replace(/\s+/g, "")
		.replace(/;+$/, "");
}

/** 解析 style 串，返回 { familyKey, bold } 或 null（含其它属性/未知字体） */
function parseFontStyle(style) {
	const declarations = style
		.split(";")
		.map((d) => d.trim())
		.filter(Boolean);
	let family = null;
	let bold = false;
	for (const declaration of declarations) {
		const colon = declaration.indexOf(":");
		if (colon < 0) return null;
		const prop = declaration.slice(0, colon).trim().toLowerCase();
		const val = declaration.slice(colon + 1).trim();
		if (prop === "font-family") family = val;
		else if (prop === "font-weight" && val.toLowerCase() === "bold") bold = true;
		else return null;
	}
	if (!family) return null;
	const key = normalize(family);
	if (!(key in FAMILY_TO_DIRECTIVE)) return null;
	return { familyKey: key, bold };
}

/** Markdown 区块：整段 span -> 行内指令 */
function migrateFontSpans(text) {
	let count = 0;
	const leftovers = new Set();
	const out = text.replace(SPAN_RE, (full, _quote, style, inner) => {
		const parsed = parseFontStyle(style);
		if (!parsed) {
			leftovers.add(style);
			return full;
		}
		let directive = FAMILY_TO_DIRECTIVE[parsed.familyKey];
		if (parsed.bold) {
			if (directive === "asebi") directive = "asebibold";
			else {
				leftovers.add(style);
				return full;
			}
		}
		if (/[[\]]/.test(inner)) {
			leftovers.add(style);
			return full;
		}
		count++;
		return `:${directive}[${inner}]`;
	});
	return { text: out, count, leftovers: [...leftovers] };
}

/** 拆分 style，返回字体族/加粗以及其余声明 */
function splitFontStyle(style) {
	const parts = style
		.split(";")
		.map((d) => d.trim())
		.filter(Boolean);
	let family = null;
	let bold = false;
	const rest = [];
	for (const declaration of parts) {
		const colon = declaration.indexOf(":");
		if (colon < 0) {
			rest.push(declaration);
			continue;
		}
		const prop = declaration.slice(0, colon).trim().toLowerCase();
		const val = declaration.slice(colon + 1).trim();
		if (prop === "font-family") family = val;
		else if (prop === "font-weight" && val.toLowerCase() === "bold") bold = true;
		else rest.push(declaration);
	}
	return { family, bold, rest };
}

const TAG_STYLE_RE =
	/<([a-zA-Z][a-zA-Z0-9-]*)(\s[^<>]*?style=(["'])(.*?)\3[^<>]*?)>/g;

/**
 * 通用：把任意标签上的 font-family 样式换成 class。
 * 支持 span/div/table/rt/ruby 等，并保留同一 style 中的其它声明。
 */
function migrateFontTags(text) {
	let count = 0;
	const leftovers = new Set();
	const out = text.replace(
		TAG_STYLE_RE,
		(full, tag, attrs, _quote, style) => {
			const { family, bold, rest } = splitFontStyle(style);
			if (!family) return full;
			// 空字体族是无效果的笔误，直接删掉该声明
			if (normalize(family) === "") {
				const newAttrs = attrs.replace(/\s*style=(["']).*?\1/, "");
				const restStyle = rest.length > 0 ? ` style="${rest.join("; ")}"` : "";
				count++;
				return `<${tag}${newAttrs}${restStyle}>`;
			}
			let className = FAMILY_TO_CLASS[normalize(family)];
			if (!className) {
				leftovers.add(`${tag}: ${style}`);
				return full;
			}
			if (bold) {
				if (className === "ff-asebi") className = "ff-asebi-bold";
				else {
					leftovers.add(`${tag}: ${style}`);
					return full;
				}
			}
			let newAttrs = attrs.replace(/\s*style=(["']).*?\1/, "");
			const restStyle = rest.length > 0 ? ` style="${rest.join("; ")}"` : "";
			if (/\sclass=(["'])/.test(newAttrs)) {
				newAttrs = newAttrs.replace(
					/(\sclass=(["']))(.*?)\2/,
					(m, pre, quote, cls) => `${pre}${cls} ${className}${quote}`,
				);
				count++;
				return `<${tag}${newAttrs}${restStyle}>`;
			}
			count++;
			return `<${tag}${newAttrs} class="${className}"${restStyle}>`;
		},
	);
	return { text: out, count, leftovers: [...leftovers] };
}

// -------------------------------------------------------- HTML block detect
const BLOCK_TAGS = new RegExp(
	`^(${[
		"address",
		"article",
		"aside",
		"base",
		"basefont",
		"blockquote",
		"body",
		"caption",
		"center",
		"col",
		"colgroup",
		"dd",
		"details",
		"dialog",
		"dir",
		"div",
		"dl",
		"dt",
		"fieldset",
		"figcaption",
		"figure",
		"footer",
		"form",
		"frame",
		"frameset",
		"h[1-6]",
		"head",
		"header",
		"hr",
		"html",
		"iframe",
		"legend",
		"li",
		"link",
		"main",
		"menu",
		"menuitem",
		"nav",
		"noframes",
		"ol",
		"optgroup",
		"option",
		"p",
		"param",
		"search",
		"section",
		"summary",
		"table",
		"tbody",
		"td",
		"tfoot",
		"th",
		"thead",
		"title",
		"tr",
		"track",
		"ul",
	].join("|")})$`,
	"i",
);

function computeHtmlBlockLines(lines) {
	const flags = new Array(lines.length).fill(false);
	let i = 0;
	while (i < lines.length) {
		const trimmed = lines[i].trimStart();
		let endType = null;
		if (/^<(script|pre|style|textarea)(\s|>|$)/i.test(trimmed)) endType = "raw";
		else if (/^<!--/.test(trimmed)) endType = "comment";
		else if (/^<\?/.test(trimmed)) endType = "pi";
		else if (/^<!\[CDATA\[/.test(trimmed)) endType = "cdata";
		else if (/^<![A-Za-z]/.test(trimmed)) endType = "decl";
		else {
			const tagMatch = trimmed.match(/^<\/?([A-Za-z][A-Za-z0-9-]*)/);
			if (tagMatch) {
				const tag = tagMatch[1].toLowerCase();
				if (BLOCK_TAGS.test(tag)) endType = "block";
				else if (/^<\/?[A-Za-z][A-Za-z0-9-]*(\s[^>]*)?\/?>\s*$/.test(trimmed))
					endType = "block";
			}
		}
		if (!endType) {
			i++;
			continue;
		}
		const start = i;
		let j = i;
		if (endType === "comment") {
			while (j < lines.length && !/-->/.test(lines[j])) j++;
		} else if (endType === "pi") {
			while (j < lines.length && !/\?>/.test(lines[j])) j++;
		} else if (endType === "cdata") {
			while (j < lines.length && !/\]\]>/.test(lines[j])) j++;
		} else if (endType === "decl") {
			while (j < lines.length && !/>/.test(lines[j])) j++;
		} else if (endType === "raw") {
			const closeRe = /<\/(script|pre|style|textarea)>/i;
			while (j < lines.length && !closeRe.test(lines[j])) j++;
		} else {
			while (j < lines.length && lines[j].trim() !== "") j++;
			j--;
		}
		j = Math.min(j, lines.length - 1);
		for (let k = start; k <= j; k++) flags[k] = true;
		i = j + 1;
	}
	return flags;
}

// ---------------------------------------------------------- style block
const CANON = {
	".shi": ["text-align:center", "font-family:kaiti"],
	".ci": ["font-family:kaiti"],
	".ci p": ["text-indent:2em", "margin:0.5em0"],
	".spellcard": ["text-align:center", "font-family:kaiti"],
	".poet": ["text-align:center", "font-family:oldenglishonglisch"],
	".waka": ["text-align:center", "font-family:dfkai-sb"],
};

const RULE_RE = /([^{}]+)\{([^{}]*)\}/g;
const COMMENT_RE = /\/\*[\s\S]*?\*\//g;

function normalizeDeclarations(body) {
	return body
		.replace(COMMENT_RE, "")
		.split(";")
		.map((d) => d.trim())
		.filter(Boolean)
		.map(normalize);
}

function cleanStyleBlocks(text) {
	let removedRules = 0;
	let removedBlocks = 0;
	const out = text.replace(/<style>([\s\S]*?)<\/style>/g, (full, css) => {
		const stripped = css.replace(COMMENT_RE, "");
		let changed = false;
		const newCss = stripped.replace(RULE_RE, (rule, selector, body) => {
			const canon = CANON[selector.trim()];
			if (!canon) return rule;
			const declarations = normalizeDeclarations(body);
			if (declarations.length === 0) return rule;
			if (!declarations.every((d) => canon.includes(d))) return rule;
			changed = true;
			removedRules++;
			return "";
		});
		if (!changed) return full;
		const remaining = newCss.trim();
		if (remaining === "") {
			removedBlocks++;
			return "";
		}
		return `<style>${newCss}</style>`;
	});
	return { text: out, removedRules, removedBlocks };
}

// --------------------------------------------------------------- driver
function migrateFile(original) {
	const lines = original.split("\n");
	const flags = computeHtmlBlockLines(lines);

	const totals = { ruby: 0, font: 0, rubySkipped: 0, fontSkipped: 0 };
	const leftovers = [];

	let result = "";
	let i = 0;
	while (i < lines.length) {
		const inHtml = flags[i];
		let j = i;
		while (j < lines.length && flags[j] === inHtml) j++;
		const chunk = lines.slice(i, j).join("\n");
		if (inHtml) {
			const font = migrateFontTags(chunk);
			result += font.text;
			totals.font += font.count;
			totals.fontSkipped += font.leftovers.length;
			leftovers.push(...font.leftovers);
		} else {
			const ruby = migrateRuby(chunk);
			const spans = migrateFontSpans(ruby.text);
			const font = migrateFontTags(spans.text);
			result += font.text;
			totals.ruby += ruby.count;
			totals.font += spans.count + font.count;
			totals.fontSkipped += spans.leftovers.length + font.leftovers.length;
			leftovers.push(...spans.leftovers, ...font.leftovers);
		}
		if (j < lines.length) result += "\n";
		i = j;
	}

	const style = cleanStyleBlocks(result);
	return { text: style.text, leftovers, ...totals, ...style };
}

const files = fs
	.readdirSync(POSTS_DIR)
	.filter((f) => f.endsWith(".md"))
	.sort();

const totals = { ruby: 0, font: 0, rules: 0, blocks: 0 };
const leftoverFamilies = new Map();

for (const file of files) {
	const fullPath = path.join(POSTS_DIR, file);
	const original = fs.readFileSync(fullPath, "utf8");
	const migrated = migrateFile(original);

	totals.ruby += migrated.ruby;
	totals.font += migrated.font;
	totals.rules += migrated.removedRules;
	totals.blocks += migrated.removedBlocks;

	for (const leftover of migrated.leftovers) {
		leftoverFamilies.set(leftover, (leftoverFamilies.get(leftover) ?? 0) + 1);
	}

	if (migrated.text !== original && !DRY_RUN) {
		fs.writeFileSync(fullPath, migrated.text);
	}

	if (migrated.ruby || migrated.font || migrated.removedRules) {
		console.log(
			`${file}: ruby=${migrated.ruby} font=${migrated.font} rules=${migrated.removedRules} blocks=${migrated.removedBlocks}`,
		);
	}
}

console.log("\n=== TOTAL ===");
console.log(totals);
if (DRY_RUN) console.log("(dry-run, no files written)");

if (leftoverFamilies.size > 0) {
	console.log("\n=== 未迁移的 span style（需人工判断）===");
	for (const [style, n] of [...leftoverFamilies.entries()].sort(
		(a, b) => b[1] - a[1],
	)) {
		console.log(`  ${n}×  ${style}`);
	}
}
