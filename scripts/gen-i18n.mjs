/**
 * Extract the ArchiveAeonivacuus UI translations into `templates/i18n.json`
 * so the Typst templates can read them with `json()`.
 *
 * Usage:
 *   node scripts/gen-i18n.mjs
 *   ARCHIVE_I18N=/path/to/src/i18n node scripts/gen-i18n.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SRC =
  process.env.ARCHIVE_I18N ??
  path.join(os.homedir(), "GitRepo/ArchiveAeonivacuus.github.io/src/i18n");

const keysSource = fs.readFileSync(path.join(SRC, "i18nKey.ts"), "utf8");
const keys = [...keysSource.matchAll(/^\s*(\w+)\s*=\s*"/gm)].map((match) => match[1]);

const table = {};
const files = fs.readdirSync(path.join(SRC, "languages")).filter((file) => file.endsWith(".ts"));
for (const file of files) {
  const lang = file.replace(/\.ts$/, "");
  const text = fs.readFileSync(path.join(SRC, "languages", file), "utf8");
  const entry = {};
  const re = /\[Key\.(\w+)\]:\s*"((?:[^"\\]|\\.)*)"/g;
  let match;
  while ((match = re.exec(text)) !== null) entry[match[1]] = match[2].replace(/\\"/g, '"');
  for (const key of keys) if (!(key in entry)) entry[key] = key;
  table[lang] = entry;
}

fs.writeFileSync("templates/i18n.json", `${JSON.stringify(table, null, 2)}\n`);
console.log(`wrote templates/i18n.json (${files.length} languages, ${keys.length} keys)`);
