/**
 * Extract `[site.info]` from tola.toml into `templates/site-info.json`.
 *
 * The Tola compiler injects site metadata as a dict input, which the bare Typst
 * CLI (and the Tinymist editor preview) cannot reproduce. Reading the same JSON
 * from the templates keeps the downloaded PDF and the editor preview identical.
 *
 * Usage: node scripts/build-site-info.mjs
 */

import fs from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const info = {};
let inSection = false;
for (const raw of fs.readFileSync(join(root, "tola.toml"), "utf8").split(/\r?\n/)) {
  const line = raw.trim();
  if (line.startsWith("[")) {
    inSection = line === "[site.info]";
    continue;
  }
  if (!inSection || line === "" || line.startsWith("#")) continue;
  const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*"(.*)"\s*(?:#.*)?$/);
  if (match) info[match[1]] = match[2];
}

fs.writeFileSync(join(root, "templates", "site-info.json"), `${JSON.stringify(info, null, 2)}\n`);
console.log(`wrote templates/site-info.json (${Object.keys(info).length} fields)`);
