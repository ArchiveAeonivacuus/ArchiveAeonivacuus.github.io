/* Create a new post markdown file with front-matter.
 *
 * Usage:
 *   pnpm new-post <filename> [--lang=ja] [--translate-key=key]
 *                            [--title="标题"] [--category=门类]
 *                            [--tags=a,b] [--description=...]
 *                            [--image=path] [--draft]
 *
 * When --translate-key points at an existing post, its published/tags/category/image
 * are inherited automatically, so a translation only needs a new title.
 */

import fs from "fs";
import path from "path";

const POSTS_DIR = "./src/content/posts";

function getDate() {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function parseArgs(argv) {
	const flags = {};
	const positional = [];
	for (const arg of argv) {
		const match = arg.match(/^--([^=]+)(?:=(.*))?$/);
		if (match) flags[match[1]] = match[2] ?? true;
		else positional.push(arg);
	}
	return { flags, positional };
}

function parseFrontmatter(text) {
	const match = text.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const data = {};
	for (const line of match[1].split("\n")) {
		const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
		if (kv) data[kv[1]] = kv[2].trim();
	}
	return data;
}

function findPostByTranslateKey(key) {
	if (!fs.existsSync(POSTS_DIR)) return null;
	for (const file of fs.readdirSync(POSTS_DIR)) {
		if (!file.endsWith(".md")) continue;
		const data = parseFrontmatter(
			fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
		);
		const normalized = data?.translate_key?.replace(/^['"]|['"]$/g, "");
		if (normalized === key) return data;
	}
	return null;
}

const { flags, positional } = parseArgs(process.argv.slice(2));

if (positional.length === 0) {
	console.error(`Error: No filename argument provided
Usage: pnpm new-post <filename> [--lang=ja] [--translate-key=key] [--category=...] [--tags=a,b]`);
	process.exit(1);
}

const slug = positional[0].replace(/\.(md|mdx)$/i, "");
const lang = typeof flags.lang === "string" ? flags.lang : "";
const translateKey =
	typeof flags["translate-key"] === "string" ? flags["translate-key"] : "";

const fileName = lang && lang !== "zh_CN" ? `${slug}_${lang}.md` : `${slug}.md`;
const fullPath = path.join(POSTS_DIR, fileName);

if (fs.existsSync(fullPath)) {
	console.error(`Error: File ${fullPath} already exists `);
	process.exit(1);
}

// Inherit metadata from the main version when creating a translation
const base =
	translateKey && translateKey.trim() !== ""
		? findPostByTranslateKey(translateKey)
		: null;

const title =
	typeof flags.title === "string" ? flags.title : slug;
const published =
	base?.published?.replace(/['"]/g, "") || getDate();
const description =
	typeof flags.description === "string" ? flags.description : base?.description || "''";
const image = typeof flags.image === "string" ? flags.image : base?.image || "''";
const tags =
	typeof flags.tags === "string"
		? `[${flags.tags}]`
		: base?.tags || "[]";
const category =
	typeof flags.category === "string"
		? `'${flags.category}'`
		: base?.category || "''";
const draft = flags.draft ? "true" : "false";

const content = `---
title: ${title}
published: ${published}
description: ${description}
image: ${image}
tags: ${tags}
category: ${category}
draft: ${draft}
lang: '${lang}'
translate_key: '${translateKey}'
---
`;

const dirPath = path.dirname(fullPath);
if (!fs.existsSync(dirPath)) {
	fs.mkdirSync(dirPath, { recursive: true });
}

fs.writeFileSync(fullPath, content);

console.log(`Post ${fullPath} created`);
if (base) console.log(`Inherited metadata from translate_key "${translateKey}"`);
