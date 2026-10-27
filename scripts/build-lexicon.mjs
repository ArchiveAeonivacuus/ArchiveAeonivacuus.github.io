import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, "content", "lexicon");
const OUT = path.join(ROOT, "assets", "lexicon");

const FIELD_ORDER = ["word", "phonetic", "pos", "meaning", "notes"];
const DEFAULT_LABELS = {
  word: "词形",
  pos: "词性",
  phonetic: "读音",
  notes: "注释",
  meaning: "释义",
};

// Header labels are deliberately generic so a word list needs no separate
// manifest. Legacy exports with the old labels are still accepted.
const HEADER_ALIASES = {
  word: ["word", "词形", "詞形", "ƿörds"],
  pos: ["pos", "词性", "詞性", "parts des spracs"],
  phonetic: ["phonetic", "读音", "讀音", "phónen spézıalıs"],
  notes: ["notes", "注释", "註釋", "nóts"],
  meaning: ["meaning", "释义", "釋義", "地球汉语", "Térrano Kanzocan"],
};

// `format` uses the same short names as the Typst inline-font components.
// Raw `ff-*` class names pass through unchanged for other project styles.
const FORMAT_CLASSES = {
  ja: "ff-ja",
  kr: "ff-kr",
  "old-ja": "ff-ja_old",
  ong: "ff-ong",
  en: "ff-en",
  ar: "ff-ar",
  rom: "ff-rom",
  zh: "ff-zh_cn",
  "zh-tw": "ff-zh_tw",
  "old-cjk": "ff-cjk_old",
  lxgw: "ff-lxgw",
  kai: "ff-kai",
  mincho: "ff-min",
};

function formatClass(value) {
  return FORMAT_CLASSES[value] ?? (value.startsWith("ff-") ? value : `ff-${value}`);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function fieldForHeader(value) {
  const text = value.trim();
  const lower = text.toLowerCase();
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === lower || alias === text)) return key;
  }
  return null;
}

function readSource(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  const meta = {};

  // Leading `# key: value` lines describe the language. The first non-# row
  // is the generic column header.
  while (lines.length > 0 && lines[0].trimStart().startsWith("#")) {
    const line = lines.shift().replace(/^#\s*/, "").trim();
    const colon = line.indexOf(":");
    if (colon > 0) meta[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim();
  }

  const rows = parseCsv(lines.join("\n"));
  if (rows.length === 0) throw new Error(`${file}: empty CSV`);
  const header = rows[0].map((value) => value.trim());
  return { meta, header, rows: rows.slice(1) };
}

function cell(row, index) {
  return index >= 0 ? (row[index] ?? "").trim() : "";
}

function hashJson(value) {
  return crypto.createHash("sha1").update(JSON.stringify(value)).digest("hex").slice(0, 10);
}

const files = fs
  .readdirSync(SOURCE)
  .filter((file) => file.toLowerCase().endsWith(".csv"))
  .sort((a, b) => a.localeCompare(b, "zh-Hans"));

if (files.length === 0) throw new Error(`${SOURCE}: no CSV word lists`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const index = { languages: [] };
let total = 0;

for (const file of files) {
  const id = path.basename(file, path.extname(file));
  const { meta, header, rows } = readSource(path.join(SOURCE, file));
  const positions = {};
  for (const key of FIELD_ORDER) {
    const at = header.findIndex((value) => fieldForHeader(value) === key);
    if (at < 0) {
      throw new Error(`${file}: missing a column for "${key}". Use header: word,pos,phonetic,notes,meaning`);
    }
    positions[key] = at;
  }

  const name = meta.name || id;
  const native = meta.native || name;
  const description = meta.description || "";
  const format = meta.format || "";
  const wordClass = meta.wordclass || (format ? formatClass(format) : "");
  const nativeClass = meta.nativeclass || (format ? formatClass(format) : "");

  const entries = [];
  for (const row of rows) {
    const entry = Object.fromEntries(FIELD_ORDER.map((key) => [key, cell(row, positions[key])]));
    if (!entry.word && !entry.meaning) continue;
    entries.push(entry);
  }

  const uniqueWords = new Set(entries.map((entry) => entry.word).filter(Boolean)).size;
  const notesCount = entries.filter((entry) => entry.notes).length;
  const counts = new Map();
  for (const entry of entries) {
    if (entry.pos) counts.set(entry.pos, (counts.get(entry.pos) ?? 0) + 1);
  }
  const pos = [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, "zh-Hans"));

  const data = {
    id,
    name,
    native,
    nativeClass,
    wordClass,
    description,
    fields: FIELD_ORDER.map((key) => ({ key, label: DEFAULT_LABELS[key] })),
    stats: {
      entries: entries.length,
      uniqueWords,
      pos: pos.length,
      notes: notesCount,
    },
    pos,
    entries,
  };

  const hash = hashJson(data);
  const output = `${id}-${hash}.json`;
  fs.writeFileSync(path.join(OUT, output), JSON.stringify(data));
  index.languages.push({
    id,
    name,
    native,
    nativeClass,
    wordClass,
    description,
    count: entries.length,
    file: output,
    order: Number(meta.order ?? 0) || 0,
  });
  total += entries.length;
  console.log(`[lexicon] ${name}: ${entries.length} entries, ${uniqueWords} words, ${pos.length} POS -> ${output}`);
}

index.languages.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id, "zh-Hans"));
for (const language of index.languages) delete language.order;
index.total = total;
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(index));
console.log(`[lexicon] wrote ${index.languages.length} language(s), ${total} entries`);
