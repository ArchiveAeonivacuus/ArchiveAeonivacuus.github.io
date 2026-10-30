import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_LABELS,
  FIELD_ORDER,
  fieldForHeader,
  parseInlineRuns,
  parseLex,
  plainText,
  styleClass,
} from "./lex-format.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, "content", "lexicon");
const OUT = path.join(ROOT, "assets", "lexicon");

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

function readCsv(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  const meta = {};
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

const allFiles = fs.readdirSync(SOURCE).filter((file) => /\.(lex|csv)$/i.test(file));
const lexIds = new Set(
  allFiles.filter((file) => file.toLowerCase().endsWith(".lex")).map((file) => path.basename(file, path.extname(file))),
);
const files = allFiles
  .filter((file) => {
    const id = path.basename(file, path.extname(file));
    return file.toLowerCase().endsWith(".lex") || !lexIds.has(id);
  })
  .sort((a, b) => a.localeCompare(b, "zh-Hans"));

if (files.length === 0) throw new Error(`${SOURCE}: no .lex or .csv word lists`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const index = { languages: [] };
let total = 0;

for (const file of files) {
  const id = path.basename(file, path.extname(file));
  const source = path.join(SOURCE, file);
  const isLex = file.toLowerCase().endsWith(".lex");
  const parsed = isLex ? parseLex(source) : null;
  const csv = parsed ? null : readCsv(source);

  const meta = parsed?.meta ?? csv.meta;
  const header = parsed?.header ?? csv.header;
  const rows = parsed?.rows ?? csv.rows;
  const columnStyles = parsed?.columnStyles ?? {};

  const positions = {};
  for (const key of FIELD_ORDER) {
    const at = header.findIndex((value) => fieldForHeader(value) === key);
    if (at < 0) throw new Error(`${file}: missing a column for "${key}".`);
    positions[key] = at;
  }

  const name = meta.name || id;
  const native = meta.native || name;
  const description = meta.description || "";
  const format = meta.format || "";
  const wordClass = meta.wordclass || (format ? styleClass(format) : "");
  const nativeClass = meta.nativeclass || (format ? styleClass(format) : "");

  const entries = [];
  for (const row of rows) {
    const cells = parsed ? row.cells : row;
    const rowStyle = parsed ? row.style : null;
    const entry = Object.fromEntries(FIELD_ORDER.map((key) => [key, cell(cells, positions[key])]));
    if (!entry.word && !entry.meaning) continue;

    if (parsed) {
      // Only keep runs when a cell actually contains inline markup; column and
      // row styles are applied later by the renderer.
      const runs = {};
      for (const key of FIELD_ORDER) {
        const value = parseInlineRuns(entry[key]);
        if (value.some((run) => run.style)) runs[key] = value;
      }
      if (rowStyle) entry.rowStyle = rowStyle;
      if (Object.keys(runs).length > 0) {
        entry.runs = runs;
        for (const key of Object.keys(runs)) entry[key] = plainText(runs[key]);
      }
    }

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
  if (Object.keys(columnStyles).length > 0) data.columnStyles = columnStyles;

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
