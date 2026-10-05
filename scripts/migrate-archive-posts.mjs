/**
 * One-off migration of the ArchiveAeonivacuus Typst posts into this site.
 *
 * The archive repo keeps both a Markdown and a generated Typst version of each
 * post (see its scripts/migrate-posts-to-typst.mjs). We only port the Typst
 * files, adapting the frontmatter to `post.with(...)`, rewriting the component
 * import, and cleaning a few conversion artifacts:
 *
 *   - standalone `<label>` lines (unused by the archive, and sometimes contain
 *     leftover `typstmig...end` markers from the Markdown converter);
 *   - the leading title heading that duplicates the frontmatter title.
 *
 * Usage:
 *   node scripts/migrate-archive-posts.mjs
 *   ARCHIVE_SRC=/path/to/src/content/typst-posts node scripts/migrate-archive-posts.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SRC =
  process.env.ARCHIVE_SRC ??
  path.join(os.homedir(), "GitRepo/ArchiveAeonivacuus.github.io/src/content/typst-posts");
const OUT = "content/posts";

function parseValue(raw) {
  const value = raw.trim().replace(/,$/, "").trim();
  if (value === "none") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith('"')) return JSON.parse(value);
  if (value.startsWith("(")) {
    const inner = value.slice(1, -1);
    const items = [];
    const re = /"((?:\\.|[^"\\])*)"/g;
    let match;
    while ((match = re.exec(inner)) !== null) items.push(JSON.parse(`"${match[1]}"`));
    return items;
  }
  return value;
}

function parseMetadata(block) {
  const data = {};
  for (const line of block.split("\n")) {
    const match = line.match(/^\s*([A-Za-z_]+):\s*(.*)$/);
    if (match) data[match[1]] = parseValue(match[2]);
  }
  return data;
}

function typstString(value) {
  return JSON.stringify(String(value ?? ""));
}

function rewriteSrc(src) {
  return src.startsWith("/images/") ? `/assets${src}` : src;
}

function typstTuple(list) {
  if (!Array.isArray(list) || list.length === 0) return "()";
  return `(${list.map((item) => typstString(item)).join(", ")}${list.length === 1 ? "," : ""})`;
}

// Reduce a heading (or title) to plain characters so the two can be compared.
function normalize(text) {
  let result = text;
  // #ruby[base][reading] -> base (readings must not enter the comparison)
  for (let i = 0; i < 8; i++) {
    const next = result.replace(/#ruby\[((?:[^[\]]|\[[^[\]]*\])*)\]\[[^\]]*\]/g, "$1");
    if (next === result) break;
    result = next;
  }
  // unwrap remaining component calls: #foo[...] -> [...]
  for (let i = 0; i < 8; i++) {
    const next = result.replace(/#[A-Za-z][A-Za-z0-9_-]*\[/g, "[");
    if (next === result) break;
    result = next;
  }
  return result
    .replace(/\\[[\]]/g, "")
    .replace(/[[\]]/g, "")
    .replace(/[_*`~]/g, "")
    .replace(/[-—–]+/g, "-")
    .replace(/\s+/g, "")
    .toLowerCase();
}

function convert(source, file) {
  const metaMatch = source.match(/#metadata\(\(([\s\S]*?)\)\)\s*<frontmatter>/);
  if (!metaMatch) throw new Error(`${file}: metadata block not found`);
  const data = parseMetadata(metaMatch[1]);
  let body = source.slice(metaMatch.index + metaMatch[0].length);

  // Drop the archive component import; the barrel re-exports everything.
  body = body.replace(/#import\s+"[^"]*blog-components\.typ"\s*:\s*\*/, "");

  // Drop standalone labels: unused, and occasionally hold converter debris.
  body = body
    .split("\n")
    .filter((line) => !/^\s*<[^>]+>\s*$/.test(line))
    .join("\n");

  // Rewrite raw image references that pointed at the archive's public/ tree.
  body = body.replace(
    /#image\("\.\.\/\.\.\/\.\.\/public\/images\/([^"]+)"\)/g,
    (_match, name) =>
      `#web-image(src: "/assets/images/${name === "NotFound.png" ? "archive-NotFound.png" : name}", alt: "")`,
  );

  // Strip the leading title heading that repeats the frontmatter title. Other
  // leading headings (e.g. a Latin or Japanese title) are kept.
  const lines = body.split("\n");
  const headingIndexes = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*$/.test(lines[i])) continue;
    if (/^= /.test(lines[i])) {
      headingIndexes.push(i);
      continue;
    }
    break;
  }
  const target = normalize(String(data.title ?? ""));
  let dropAt = -1;
  for (const index of headingIndexes) {
    const heading = normalize(lines[index].replace(/^= /, ""));
    if (target && heading && (heading.includes(target) || target.includes(heading))) dropAt = index;
  }
  if (dropAt >= 0) lines.splice(dropAt, 1);
  body = lines.join("\n").replace(/^\s*\n/, "").trimStart();

  const fields = [`  title: ${typstString(data.title)}`];
  if (data.published) fields.push(`  date: ${typstString(data.published)}`);
  if (data.updated) fields.push(`  update: ${typstString(data.updated)}`);
  if (data.description) fields.push(`  summary: ${typstString(data.description)}`);
  if (data.image) fields.push(`  image: ${typstString(rewriteSrc(data.image))}`);
  fields.push(`  tags: ${typstTuple(data.tags)}`);
  if (data.category) fields.push(`  category: ${typstString(data.category)}`);
  if (data.lang) fields.push(`  lang: ${typstString(data.lang)}`);
  if (data.translate_key) fields.push(`  translate_key: ${typstString(data.translate_key)}`);
  fields.push(`  draft: ${data.draft ? "true" : "false"}`);

  return `#import "/templates/fuwari.typ": *\n\n#show: post.with(\n${fields.join(",\n")},\n)\n\n${body}\n`;
}

const files = fs.readdirSync(SRC).filter((file) => file.endsWith(".typ"));
fs.mkdirSync(OUT, { recursive: true });
for (const file of files) {
  const source = fs.readFileSync(path.join(SRC, file), "utf8");
  fs.writeFileSync(path.join(OUT, file), convert(source, file));
}
console.log(`migrated ${files.length} archive Typst posts -> ${OUT}`);
