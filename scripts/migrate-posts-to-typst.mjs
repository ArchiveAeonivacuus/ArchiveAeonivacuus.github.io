/**
 * Convert all Markdown posts into Typst source files without deleting the
 * originals. The generated files live in src/content/typst-posts so the
 * migration can be reviewed and compiled before switching the live routes.
 *
 * Usage:
 *   node scripts/migrate-posts-to-typst.mjs
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import YAML from "yaml";

const SOURCE_DIR = "src/content/posts";
const OUTPUT_DIR = "src/content/typst-posts";
const PANDOC_FROM = "gfm+footnotes+raw_html";

const FONT_DIRECTIVES = new Map([
	["zh_cn", "zh"],
	["ja", "ja"],
	["ja_old", "old-ja"],
	["ong", "ong"],
	["cjk_old", "old-cjk"],
	["dfkai", "dfkai"],
	["en", "ipa"],
	["rom", "latin"],
	["kai", "kai"],
	["min", "mincho"],
]);

const BLOCK_DIRECTIVES = new Map([
	["shi", "poem"],
	["poem", "poem"],
	["poem_ong", "poem-ong"],
	["poem_en", "poem-en"],
	["ci", "lyrics"],
	["spellcard", "spell"],
	["waka", "waka"],
]);

function safeMarkerPayload(value) {
	return Buffer.from(value, "utf8").toString("hex");
}

function marker(name, value = "") {
	return `TYPSTMIG${name.toUpperCase()}${value ? `X${safeMarkerPayload(value)}` : ""}END`;
}

function splitFrontmatter(source, file) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
	if (!match) throw new Error(`${file}: missing frontmatter`);
	return {
		data: YAML.parse(match[1]),
		body: source.slice(match[0].length),
	};
}

function typstString(value) {
	return JSON.stringify(value == null ? "" : String(value));
}

function metadata(data) {
	const tags = Array.isArray(data.tags)
		? `(${data.tags.map(typstString).join(", ")}${data.tags.length === 1 ? "," : ""})`
		: "()";
	return `#metadata((
  title: ${typstString(data.title)},
  published: ${typstString(data.published)},
  updated: ${data.updated ? typstString(data.updated) : "none"},
  draft: ${Boolean(data.draft)},
  description: ${typstString(data.description)},
  image: ${typstString(data.image)},
  tags: ${tags},
  category: ${typstString(data.category)},
  lang: ${typstString(data.lang)},
  translate_key: ${typstString(data.translate_key)},
  rootClass: ${typstString(data.rootClass)},
)) <frontmatter>`;
}

function protectCode(source) {
	const blocks = [];
	const text = source.replace(/(```|~~~)([^\n]*)\n[\s\S]*?\n\1/g, (value) => {
		const marker = `@@TYPST_CODE_${blocks.length}@@`;
		blocks.push(value);
		return marker;
	});
	return { text, blocks };
}

function restoreCode(source, blocks) {
	return source.replace(/@@TYPST_CODE_(\d+)@@/g, (_, index) => blocks[Number(index)]);
}

function convertContainers(source, report) {
	const lines = source.split("\n");
	const stack = [];
	const output = [];
	for (const line of lines) {
		const open = line.match(/^\s*:::(\w+)(?:\{(.*)\})?\s*$/);
		if (open) {
			const [, name, rawAttrs = ""] = open;
			if (BLOCK_DIRECTIVES.has(name)) {
				output.push(marker("open", `${BLOCK_DIRECTIVES.get(name)}\0`));
				stack.push(name);
				continue;
			}
			if (name === "dialog") {
				const person = rawAttrs.match(/(?:label|person|p|n)=["']([^"']*)["']/)?.[1] ?? "???";
				output.push(marker("open", `dialogue\0${person}`));
				stack.push(name);
				continue;
			}
			if (["note", "tip", "important", "caution", "warning"].includes(name)) {
				output.push(marker("open", `aside\0${name}`));
				stack.push(name);
				continue;
			}
		}
		if (/^\s*:::\s*$/.test(line) && stack.length > 0) {
			stack.pop();
			output.push(marker("close"));
			continue;
		}
		output.push(line);
	}
	if (stack.length > 0) report.push(`unclosed directives: ${stack.join(", ")}`);
	return output.join("\n");
}

function convertLeafDirectives(source) {
	return source
		.replace(/^::(?:card|hyperlink)\{([^}]*)\}\s*$/gm, (_, attrs) => {
			const get = (name) => attrs.match(new RegExp(`${name}=["']([^"']*)["']`))?.[1] ?? "";
			return marker("card", JSON.stringify({ href: get("href"), title: get("title"), avatar: get("avatar"), desc: get("desc") || get("description") }));
		})
		.replace(/^::github\{repo=["']([^"']+)["']\}\s*$/gm, (_, repo) => marker("github", repo));
}

function convertInlineDirectives(source) {
	let previous;
	do {
		previous = source;
		for (const [oldName, newName] of FONT_DIRECTIVES) {
			const pattern = new RegExp(`:${oldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\[([^\\[\\]\\n]*)\\]`, "g");
			source = source.replace(pattern, (_, content) => marker("inline", `${newName}\0${content}`));
		}
	} while (source !== previous);
	return source;
}

function convertRuby(source) {
	return source.replace(/\{([^{}|\n]+)\|([^{}|\n]+)\}/g, (_, base, reading) => marker("ruby", `${base}\0${reading}`));
}

function convertHtml(source, report) {
	if (/<style\b|<script\b/i.test(source)) report.push("contains raw style/script; preserved with raw-html");
	return source.replace(/<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>/g, (html) => {
		if (/^<br\s*\/?\s*>$/i.test(html)) return marker("break");
		if (/^<hr\s*\/?\s*>$/i.test(html)) return marker("divider");
		return marker("html", html);
	});
}

function convertSimpleHtmlSpans(source) {
	let previous;
	do {
		previous = source;
		source = source.replace(/<span\s+class=["']([^"']+)["']>([^\n]*?)<\/span>/g, (_, className, content) => marker("span", `${className}\0${content}`));
	} while (source !== previous);
	return source;
}

function protectImages(source) {
	return source.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g, (_, alt, src) => marker("image", `${src}\0${alt}`));
}

function runPandoc(source) {
	const temp = path.join(os.tmpdir(), `aeonivacuus-${process.pid}-${Math.random().toString(36).slice(2)}.md`);
	fs.writeFileSync(temp, source);
	try {
		return execFileSync("pandoc", ["-f", PANDOC_FROM, "-t", "typst", "--wrap=none", temp], { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
	} finally {
		fs.rmSync(temp, { force: true });
	}
}

function restoreTypstMarkers(source) {
	let previous;
	do {
		previous = source;
		source = source
		.replace(/TYPSTMIGOPENX([0-9a-f]+)END/g, (_, encoded) => {
			const [name, value = ""] = Buffer.from(encoded, "hex").toString("utf8").split("\0");
			if (name === "dialogue") return `#dialogue(speaker: ${typstString(value)})[`;
			if (name === "aside") return `#aside(kind: ${typstString(value)})[`;
			if (name === "poem-ong") return '#poem(lang: "ong")[';
			if (name === "poem-en") return '#poem(lang: "en")[';
			return `#${name}[`;
		})
		.replaceAll(marker("close"), "]")
		.replaceAll(marker("break"), "#linebreak()")
		.replaceAll(marker("divider"), "#divider()")
		.replace(/TYPSTMIGIMAGEX([0-9a-f]+)END/g, (_, encoded) => {
			const [src, alt] = Buffer.from(encoded, "hex").toString("utf8").split("\0");
			return `#web-image(src: ${typstString(src)}, alt: ${typstString(alt)})`;
		})
		.replace(/TYPSTMIGSPANX([0-9a-f]+)END/g, (_, encoded) => {
			const [className, content] = Buffer.from(encoded, "hex").toString("utf8").split("\0");
			return `#class-span(${typstString(className)})[${content}]`;
		})
		.replace(/TYPSTMIGINLINEX([0-9a-f]+)END/g, (_, encoded) => {
			const [name, content] = Buffer.from(encoded, "hex").toString("utf8").split("\0");
			return `#${name}[${content}]`;
		})
		.replace(/TYPSTMIGRUBYX([0-9a-f]+)END/g, (_, encoded) => {
			const [base, reading] = Buffer.from(encoded, "hex").toString("utf8").split("\0");
			return `#ruby[${base}][${reading}]`;
		})
		.replace(/TYPSTMIGCARDX([0-9a-f]+)END/g, (_, encoded) => {
			const card = JSON.parse(Buffer.from(encoded, "hex").toString("utf8"));
			return `#card(href: ${typstString(card.href)}, title: ${typstString(card.title)}, avatar: ${typstString(card.avatar)})[${card.desc}]`;
		})
		.replace(/TYPSTMIGGITHUBX([0-9a-f]+)END/g, (_, encoded) => `#github(repo: ${typstString(Buffer.from(encoded, "hex").toString("utf8"))})`)
		.replace(/TYPSTMIGHTMLX([0-9a-f]+)END/g, (_, encoded) => `#raw-html(${typstString(Buffer.from(encoded, "hex").toString("utf8"))})`);
	} while (source !== previous);
	// Pandoc emits an automatic heading label on the next line. Labels derived
	// from migration sentinels are meaningless and may contain invalid names.
	return source.replace(/^<typstmig[a-z0-9-]+>\s*$/gim, "");
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
const reports = [];

for (const file of fs.readdirSync(SOURCE_DIR).filter((name) => name.endsWith(".md")).sort()) {
	const source = fs.readFileSync(path.join(SOURCE_DIR, file), "utf8");
	const { data, body } = splitFrontmatter(source, file);
	const report = [];
	const protectedCode = protectCode(body);
	let transformed = protectedCode.text;
	transformed = convertContainers(transformed, report);
	transformed = convertLeafDirectives(transformed);
	transformed = convertInlineDirectives(transformed);
	transformed = convertRuby(transformed);
	transformed = protectImages(transformed);
	transformed = convertSimpleHtmlSpans(transformed);
	transformed = convertHtml(transformed, report);
	transformed = restoreCode(transformed, protectedCode.blocks);
	let typst = restoreTypstMarkers(runPandoc(transformed));
	typst = `#import "/src/typst/blog-components.typ": *\n\n${metadata(data)}\n\n${typst}`;
	const outputFile = path.join(OUTPUT_DIR, file.replace(/\.md$/, ".html.typ"));
	fs.writeFileSync(outputFile, typst);
	reports.push(`${file}: ${report.length ? report.join("; ") : "converted"}`);
}

fs.writeFileSync(path.join(OUTPUT_DIR, "MIGRATION_REPORT.txt"), `${reports.join("\n")}\n`);
console.log(`Converted ${reports.length} posts to ${OUTPUT_DIR}`);
