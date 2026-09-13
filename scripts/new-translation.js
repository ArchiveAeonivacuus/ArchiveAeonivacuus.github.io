/* Create a translation of an existing post by cloning its front-matter.
 *
 * Usage:
 *   pnpm new-translation <base-slug> <lang> [--title="Translated title"]
 *
 * Example:
 *   pnpm new-translation lantern-under-the-ochre-vault ja --title="赭穹の下の提灯"
 *
 * The base post's published/tags/category/image/translate_key are copied, so the
 * translated file only needs its body filled in.
 */

import fs from "fs";
import path from "path";

const POSTS_DIR = "./src/content/posts";
const FIELD_ORDER = [
	"title",
	"published",
	"description",
	"image",
	"tags",
	"category",
	"draft",
	"lang",
	"translate_key",
];

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

function readFrontmatter(text) {
	const match = text.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const data = {};
	for (const line of match[1].split("\n")) {
		const kv = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
		if (kv) data[kv[1]] = kv[2].trim();
	}
	return data;
}

const { flags, positional } = parseArgs(process.argv.slice(2));

if (positional.length < 2) {
	console.error(`Error: missing arguments
Usage: pnpm new-translation <base-slug> <lang> [--title="..."]`);
	process.exit(1);
}

const [baseSlug, lang] = positional;
const basePath = path.join(POSTS_DIR, `${baseSlug}.md`);

if (!fs.existsSync(basePath)) {
	console.error(`Error: base post not found: ${basePath}`);
	process.exit(1);
}

const base = readFrontmatter(fs.readFileSync(basePath, "utf8"));
if (!base) {
	console.error(`Error: no front-matter found in ${basePath}`);
	process.exit(1);
}

const targetPath = path.join(POSTS_DIR, `${baseSlug}_${lang}.md`);
if (fs.existsSync(targetPath)) {
	console.error(`Error: File ${targetPath} already exists `);
	process.exit(1);
}

const values = {
	title: typeof flags.title === "string" ? flags.title : base.title || baseSlug,
	published: base.published || "",
	description: base.description || "''",
	image: base.image || "''",
	tags: base.tags || "[]",
	category: base.category || "''",
	draft: base.draft || "false",
	lang: `'${lang}'`,
	translate_key: base.translate_key || `'${baseSlug}'`,
};

const frontmatter = FIELD_ORDER.map((key) => `${key}: ${values[key]}`).join("\n");
fs.writeFileSync(targetPath, `---\n${frontmatter}\n---\n\n`);

console.log(`Translation ${targetPath} created`);
