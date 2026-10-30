import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_INPUT = path.join(ROOT, "content", "lexicon", "ong.csv");
const DEFAULT_OUTPUT = path.join(ROOT, "content", "lexicon", "ong.lex");

const FIELD_ORDER = ["word", "phonetic", "pos", "meaning", "notes"];
const HEADER_ALIASES = {
  word: ["word", "词形", "詞形", "ƿörds"],
  phonetic: ["phonetic", "读音", "讀音", "phónen spézıalıs"],
  pos: ["pos", "词性", "詞性", "parts des spracs"],
  meaning: ["meaning", "释义", "釋義", "地球汉语", "Térrano Kanzocan"],
  notes: ["notes", "注释", "註釋", "nóts"],
};

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

function convertInlineTags(text) {
  return text.replace(/<([a-zA-Z][\w-]*)>([\s\S]*?)<\/\1>/g, (_, style, body) => {
    return `#${style}[${convertInlineTags(body)}]`;
  });
}

function escapeCell(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|");
}

function cell(row, index) {
  return index >= 0 ? (row[index] ?? "") : "";
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const positional = args.filter((arg) => !arg.startsWith("--"));
const input = path.resolve(positional[0] ?? DEFAULT_INPUT);
const output = path.resolve(positional[1] ?? DEFAULT_OUTPUT);

if (fs.existsSync(output) && !force) {
  throw new Error(`${output} already exists; refusing to overwrite. Pass --force to replace it.`);
}

const { meta, header, rows } = readCsv(input);
const positions = {};
for (const key of FIELD_ORDER) {
  const at = header.findIndex((value) => fieldForHeader(value) === key);
  if (at < 0) {
    throw new Error(`${input}: missing a column for "${key}". Found: ${header.join(", ")}`);
  }
  positions[key] = at;
}

const entries = [];
for (const row of rows) {
  const entry = Object.fromEntries(FIELD_ORDER.map((key) => [key, cell(row, positions[key]).trim()]));
  if (!entry.word && !entry.meaning) continue;
  entries.push(entry);
}

const metaLines = Object.entries(meta).map(([key, value]) => `# ${key}: ${value}`);
if (!meta.name) metaLines.push("# name: " + path.basename(input, path.extname(input)));
if (!meta.native) metaLines.push("# native: " + (meta.name || path.basename(input, path.extname(input))));
if (meta.format) metaLines.push("#column word " + meta.format);

const lines = [
  ...metaLines,
  "",
  "word | phonetic | pos | meaning | notes",
];

for (const entry of entries) {
  const values = FIELD_ORDER.map((key) => {
    const text = convertInlineTags(entry[key]);
    return escapeCell(text);
  });
  lines.push(values.join(" | "));
}

fs.writeFileSync(output, `${lines.join("\n")}\n`, "utf8");
console.log(`[lexicon] converted ${entries.length} entries from ${path.relative(ROOT, input)} to ${path.relative(ROOT, output)}`);
console.log("[lexicon] inline <ong>...</ong> becomes #ong[...] in the .lex file");
