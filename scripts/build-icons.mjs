#!/usr/bin/env node
/**
 * Regenerate the self-hosted Iconify data in `assets/icons/`.
 *
 * The site only uses a handful of icons, so shipping those collections makes
 * icon rendering a same-origin request instead of a round trip to
 * api.iconify.design (which is slow from mainland China).
 *
 * Run manually after adding/removing an `icon("...")` call:
 *   node scripts/build-icons.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "assets", "icons");
const SOURCES = [path.join(ROOT, "templates"), path.join(ROOT, "content")];

function walk(dir, seen) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, seen);
    else if (/\.(typ|html)$/.test(entry.name)) {
      const text = fs.readFileSync(full, "utf8");
      for (const match of text.matchAll(/(?:material-symbols|fa6-brands|fa6-regular|fa6-solid):[a-z0-9-]+/g)) {
        seen.add(match[0]);
      }
    }
  }
}

const names = new Set();
for (const source of SOURCES) walk(source, names);
const groups = new Map();
for (const name of names) {
  if (!name.includes(":")) continue;
  const [prefix, ...rest] = name.split(":");
  if (!groups.has(prefix)) groups.set(prefix, new Set());
  groups.get(prefix).add(rest.join(":"));
}

fs.mkdirSync(OUT, { recursive: true });

async function fetchIcons(prefix, names) {
  const url = `https://api.iconify.design/${prefix}.json?icons=${encodeURIComponent(names.join(","))}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${prefix}: HTTP ${response.status}`);
  return response.json();
}

for (const [prefix, icons] of [...groups].sort()) {
  const names = [...icons].sort();
  const data = await fetchIcons(prefix, names);
  const collection = {
    prefix,
    icons: { ...(data.icons || {}) },
    aliases: { ...(data.aliases || {}) },
    ...(data.width ? { width: data.width } : {}),
    ...(data.height ? { height: data.height } : {}),
  };

  // The API occasionally drops entries from a large batch; fetch those one by
  // one so every icon used by the site is present in the local collection.
  const missing = names.filter((name) => !collection.icons[name] && !collection.aliases[name]);
  for (const name of missing) {
    const single = await fetchIcons(prefix, [name]);
    Object.assign(collection.icons, single.icons || {});
    Object.assign(collection.aliases, single.aliases || {});
  }
  const stillMissing = names.filter((name) => !collection.icons[name] && !collection.aliases[name]);
  if (stillMissing.length) throw new Error(`${prefix}: missing ${stillMissing.join(", ")}`);

  fs.writeFileSync(path.join(OUT, `${prefix}.json`), JSON.stringify(collection));
  console.log(`${prefix}: ${names.length} icons (${missing.length} fetched individually)`);
}
