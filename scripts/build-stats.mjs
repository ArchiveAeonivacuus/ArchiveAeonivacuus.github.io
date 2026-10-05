// Compute per-page word count and reading time, written to templates/stats.json.
// Templates read it via Typst's json(). Run before the Tola build.
// Usage: node scripts/build-stats.mjs
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const outFile = join(root, "templates", "stats.json");

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (name.endsWith(".typ")) files.push(full);
  }
  return files;
}

function permalinkOf(rel) {
  if (rel === "index.typ") return "/";
  if (rel.endsWith("/index.typ")) return "/" + rel.slice(0, -"/index.typ".length) + "/";
  return "/" + rel.replace(/\.typ$/, "") + "/";
}

function stripToText(source) {
  let text = source;
  text = text.replace(/```[\s\S]*?```/g, " "); // fenced code
  text = text.replace(/^#import .*$/gm, " "); // imports
  text = text.replace(/#show:\s*post\.with\([\s\S]*?^\)$/m, " "); // metadata block
  text = text.replace(/https?:\/\/\S+/g, " "); // urls
  text = text.replace(/#[a-zA-Z][\w-]*/g, " "); // typst commands
  return text;
}

function countWords(text) {
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + latin;
}

const stats = {};
for (const file of walk(contentDir)) {
  const rel = relative(contentDir, file).split("\\").join("/");
  const words = countWords(stripToText(readFileSync(file, "utf8")));
  stats[permalinkOf(rel)] = { w: words, m: Math.max(1, Math.round(words / 300)) };
}

const sorted = Object.fromEntries(Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(outFile, JSON.stringify(sorted, null, 2) + "\n");
console.log(`[stats] ${Object.keys(stats).length} pages`);
