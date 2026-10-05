/**
 * Extract the ArchiveAeonivacuus word dictionary (categories/tags translations,
 * including the Japanese `<ruby>` markup) into `templates/words.json`.
 *
 * Usage:
 *   node scripts/gen-words.mjs
 *   ARCHIVE_WORDS=/path/to/src/constants/translations.ts node scripts/gen-words.mjs
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SRC =
  process.env.ARCHIVE_WORDS ??
  path.join(os.homedir(), "GitRepo/ArchiveAeonivacuus.github.io/src/constants/translations.ts");

const table = {};
let current = null;
for (const line of fs.readFileSync(SRC, "utf8").split("\n")) {
  const open = line.match(/^\t([^\t{]+):\s*\{\s*$/);
  if (open) {
    current = open[1].trim();
    table[current] = {};
    continue;
  }
  if (/^\t\},?\s*$/.test(line)) {
    current = null;
    continue;
  }
  const kv = line.match(/^\t\t([A-Za-z_]+):\s*"(.*)",?\s*$/);
  if (kv && current) table[current][kv[1]] = kv[2];
}

fs.writeFileSync("templates/words.json", `${JSON.stringify(table, null, 2)}\n`);
console.log(`wrote templates/words.json (${Object.keys(table).length} entries)`);
