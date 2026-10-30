import fs from "node:fs";

export const FIELD_ORDER = ["word", "phonetic", "pos", "meaning", "notes"];
export const DEFAULT_LABELS = {
  word: "词形",
  pos: "词性",
  phonetic: "读音",
  notes: "注释",
  meaning: "释义",
};

export const HEADER_ALIASES = {
  word: ["word", "词形", "詞形", "ƿörds"],
  pos: ["pos", "词性", "詞性", "parts des spracs"],
  phonetic: ["phonetic", "读音", "讀音", "phónen spézıalıs"],
  notes: ["notes", "注释", "註釋", "nóts"],
  meaning: ["meaning", "释义", "釋義", "地球汉语", "Térrano Kanzocan"],
};

export const STYLE_CLASSES = {
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

export function styleClass(style) {
  return STYLE_CLASSES[style] ?? (style.startsWith("ff-") ? style : `ff-${style}`);
}

export function fieldForHeader(value) {
  const text = value.trim();
  const lower = text.toLowerCase();
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((alias) => alias.toLowerCase() === lower || alias === text)) return key;
  }
  return null;
}

function splitCells(line) {
  const cells = [];
  let current = "";
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === "\\" && i + 1 < line.length) {
      current += line[i + 1];
      i += 1;
    } else if (char === "|") {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function findClosingBracket(text, start) {
  let depth = 1;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === "\\" ) {
      i += 1;
    } else if (text[i] === "[") {
      depth += 1;
    } else if (text[i] === "]") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** Parse `#ong[...]` runs from a cell. Nested styles override the outer one. */
export function parseInlineRuns(text) {
  const runs = [];
  let plain = "";

  const flush = () => {
    if (plain) runs.push({ text: plain, style: null });
    plain = "";
  };

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== "#") {
      plain += text[i];
      continue;
    }

    const match = /^#([A-Za-z][\w-]*)\[/.exec(text.slice(i));
    if (!match) {
      plain += text[i];
      continue;
    }

    const bodyStart = i + match[0].length;
    const bodyEnd = findClosingBracket(text, bodyStart);
    if (bodyEnd < 0) {
      plain += text[i];
      continue;
    }

    flush();
    const style = match[1];
    for (const run of parseInlineRuns(text.slice(bodyStart, bodyEnd))) {
      runs.push({ text: run.text, style: run.style ?? style });
    }
    i = bodyEnd;
  }

  flush();
  if (runs.length === 0) runs.push({ text: "", style: null });
  return runs;
}

export function plainText(runs) {
  return runs.map((run) => run.text).join("");
}

export function parseLex(file) {
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = raw.split(/\r?\n/);
  const meta = {};
  const columnStyles = {};
  let header = null;
  const rows = [];

  for (const sourceLine of lines) {
    const line = sourceLine.trim();
    if (!line) continue;
    if (line.startsWith("#")) {
      const body = line.replace(/^#\s*/, "");
      if (body.startsWith("column ")) {
        const [, field, style] = /^column\s+(\S+)\s+(\S+)/.exec(body) ?? [];
        if (field && style) columnStyles[field] = style;
        continue;
      }
      const colon = body.indexOf(":");
      if (colon > 0) meta[body.slice(0, colon).trim().toLowerCase()] = body.slice(colon + 1).trim();
      continue;
    }
    if (!header) {
      header = splitCells(line);
      continue;
    }

    let rowStyle = null;
    let rowText = line;
    const styleMatch = /^@([A-Za-z][\w-]*)\s*\|/.exec(line);
    if (styleMatch) {
      rowStyle = styleMatch[1];
      rowText = line.slice(styleMatch[0].length);
    }
    rows.push({ style: rowStyle, cells: splitCells(rowText) });
  }

  if (!header) throw new Error(`${file}: missing header row`);
  return { meta, columnStyles, header, rows };
}
