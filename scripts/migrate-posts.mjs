// Convert Fuwari Markdown posts into Typst content for the Tola site.
// Usage: node scripts/migrate-posts.mjs
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const SOURCE = join(process.env.HOME, "GitRepo/fuwari/src/content/posts");
const OUT = join(root, "content/posts");
const ASSET_OUT = join(root, "assets/posts");

const md = new MarkdownIt({ html: false, linkify: false, breaks: false });

const POSTS = [
  "hello-world.md",
  "a-problem-during-c-programming.md",
  "how-to-program-awesomely.md",
  "bomb-lab.md",
  "how-to-become-a-hacker.md",
  "how-to-ask-questions-the-smart-way.md",
  "niri-manual/index.md",
];

function escapeText(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/([#$*_\[\]@<>`~])/g, "\\$1");
}

function escapeString(text) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t");
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const data = {};
  if (!match) return { data, body: raw };
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    } else {
      value = value.replace(/^['"]|['"]$/g, "");
    }
    data[m[1]] = value;
  }
  return { data, body: raw.slice(match[0].length) };
}

function readingStats(body) {
  const text = body.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_`\[\]()!-]/g, " ");
  const cjk = (text.match(/[\u4e00-\u9fff\u3040-\u30ff]/g) || []).length;
  const latin = (text.match(/[A-Za-z0-9]+/g) || []).length;
  const words = cjk + latin;
  return { words, minutes: Math.max(1, Math.round(words / 300)) };
}

const ATTR_RE = /([a-zA-Z-]+)\s*=\s*"([^"]*)"/g;

function normalizeMath(body) {
  if (/names\s*=/.test(body)) {
    return '"names" = { "row.name" | "row" in "users" and "row.name" >= 18 }';
  }
  return body
    .replace(/\\mathbf\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\{([^}]*)\}/g, "$1")
    .replace(/\\text\{([^}]*)\}/g, '"$1"')
    .replace(/\\(left|right|displaystyle|limits|quad|qquad)/g, " ")
    .replace(/\\[,;:!]/g, " ")
    .replace(/\\land/g, "and ")
    .replace(/\\lor/g, "or ")
    .replace(/\\lnot/g, "not ")
    .replace(/\\ge(q)?/g, ">=")
    .replace(/\\le(q)?/g, "<=")
    .replace(/\\ne(q)?/g, "!=")
    .replace(/\\notin/g, "in.not ")
    .replace(/\\in/g, "in ")
    .replace(/\\times/g, "times ")
    .replace(/\\cdot/g, "dot ")
    .replace(/\\rightarrow|\\to/g, "-> ")
    .replace(/\\leftarrow|\\gets/g, "<- ")
    .replace(/\\Rightarrow/g, "=> ")
    .replace(/\\sum/g, "sum ")
    .replace(/\\prod/g, "product ")
    .replace(/\\int/g, "integral ")
    .replace(/\\infty/g, "infinity ")
    .replace(/\\forall/g, "forall ")
    .replace(/\\exists/g, "exists ")
    .replace(/\\partial/g, "diff ")
    .replace(/\\nabla/g, "nabla ")
    .replace(/\\sqrt\{([^}]*)\}/g, "sqrt($1)")
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
    .replace(/\\(alpha|beta|gamma|delta|epsilon|zeta|eta|theta|iota|kappa|lambda|mu|nu|xi|pi|rho|sigma|tau|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Pi|Sigma|Phi|Psi|Omega)/g, "$1")
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}")
    .replace(/\\_/g, "_")
    .replace(/\\%/g, "%")
    .replace(/\\\\/g, "\\ ");
}

function stripHtml(line, env) {
  return line
    .replace(/<a\b[^>]*(?:id|name)=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, id, inner) => {
      const index = env.inline.length;
      env.inline.push(`#anchor("${escapeString(id)}")`);
      return `ZZIM${index}ZZ${inner}`;
    })
    .replace(/<a\b[^>]*>\s*<\/a>/gi, "")
    .replace(/<a\b[^>]*>/gi, "")
    .replace(/<\/a>/gi, "")
    .replace(/<span\b[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<p\b[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/<br\s*\/?>/gi, "  ")
    .replace(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/gi, (_m, src) => `![](${src.replace(/^\/images\//, "/assets/images/")})`);
}

function mathInline(line, env) {
  const parts = line.split("`");
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(/\$([^$\n]+?)\$/g, (_m, body) => {
      const index = env.inline.length;
      env.inline.push(`$${normalizeMath(body)}$`);
      return `ZZIM${index}ZZ`;
    });
  }
  return parts.join("`");
}

function convertBody(source, env, imageBase) {
  const lines = source.split("\n");
  const prepared = [];
  let insideFence = false;
  let fenceMarker = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (fence) {
      if (!insideFence) { insideFence = true; fenceMarker = fence[2][0]; }
      else if (fence[2][0] === fenceMarker) { insideFence = false; }
      prepared.push(line);
      continue;
    }
    if (insideFence) { prepared.push(line); continue; }

    if (/^\s*\[\/\/\]:/.test(line)) continue;

    const directive = line.match(/^:::+\s*([a-zA-Z]+)\s*(.*)$/);
    if (directive) {
      const kind = directive[1].toLowerCase();
      const rest = directive[2].trim();
      const attrs = {};
      let m;
      ATTR_RE.lastIndex = 0;
      while ((m = ATTR_RE.exec(rest))) attrs[m[1]] = m[2];
      const titleMatch = rest.match(/\[([^\]]*)\]/);

      const inner = [];
      if (!/^:::+$/.test(lines[i + 1] || "")) {
        let j = i + 1;
        while (j < lines.length && !/^:::\s*$/.test(lines[j])) { inner.push(lines[j]); j++; }
        i = j;
      } else {
        i += 1;
      }

      let snippet;
      if (kind === "link") {
        snippet = `#link-card("${escapeString(attrs.href || "#")}", "${escapeString(attrs.title || attrs.href || "")}", avatar: "${escapeString(attrs.avatar || "")}", description: "${escapeString(attrs.description || "")}")`;
      } else if (kind === "github") {
        snippet = `#github-card("${escapeString(attrs.repo || "")}")`;
      } else {
        const title = titleMatch ? escapeString(titleMatch[1]) : "none";
        const titleArg = titleMatch ? `"${title}"` : "none";
        snippet = `#admonition(kind: "${kind}", title: ${titleArg})[\n${convertBody(inner.join("\n"), env, imageBase)}\n]`;
      }
      const index = env.blocks.length;
      env.blocks.push(snippet);
      prepared.push("", `ZZPH${index}ZZ`, "");
      continue;
    }

    if (/^::[a-z]+\{/.test(line)) {
      const m = line.match(/^::[a-z]+\{(.*)\}\s*$/);
      if (m) {
        const attrs = {};
        let mm;
        ATTR_RE.lastIndex = 0;
        while ((mm = ATTR_RE.exec(m[1]))) attrs[mm[1]] = mm[2];
        const snippet = `#github-card("${escapeString(attrs.repo || "")}")`;
        const index = env.blocks.length;
        env.blocks.push(snippet);
        prepared.push("", `ZZPH${index}ZZ`, "");
        continue;
      }
    }

    const blockMath = line.trim().match(/^\$\$(.+)\$\$$/);
    if (blockMath) {
      const index = env.blocks.length;
      env.blocks.push(`$ ${normalizeMath(blockMath[1].trim())} $`);
      prepared.push("", `ZZPH${index}ZZ`, "");
      continue;
    }
    prepared.push(mathInline(stripHtml(line, env), env));
  }

  const text = prepared.join("\n");
  const tokens = md.parse(text, env);
  return renderTokens(tokens, env, imageBase);
}

function renderInline(children, env, imageBase) {
  let out = "";
  for (const token of children) {
    switch (token.type) {
      case "text": {
        let value = escapeText(token.content);
        value = value.replace(/ZZIM(\d+)ZZ/g, (_m, n) => env.inline[Number(n)] ?? "");
        out += value;
        break;
      }
      case "strong_open": out += "*"; break;
      case "strong_close": out += "*"; break;
      case "s_open": out += "#strike["; break;
      case "s_close": out += "]"; break;
      case "escape": out += escapeText(token.content); break;
      case "entity": out += escapeText(token.content); break;
      case "em_open": out += "_"; break;
      case "em_close": out += "_"; break;
      case "code_inline": {
        const code = token.content;
        const ticks = code.includes("`") ? "``" : "`";
        out += `${ticks}${code}${ticks}`;
        break;
      }
      case "link_open": {
        const href = (token.attrs || []).find((a) => a[0] === "href")?.[1] ?? "#";
        out += `#link("${escapeString(href)}")[`;
        break;
      }
      case "link_close": out += "]"; break;
      case "image": {
        const src = (token.attrs || []).find((a) => a[0] === "src")?.[1] ?? "";
        const alt = (token.attrs || []).find((a) => a[0] === "alt")?.[1] ?? "";
        out += `#content-image("${escapeString(resolveImage(src, env, imageBase))}", alt: "${escapeString(alt)}")`;
        break;
      }
      case "softbreak": out += "\n"; break;
      case "hardbreak": out += "\\\n"; break;
      default: break;
    }
  }
  return out;
}

function resolveImage(src, env, imageBase) {
  if (/^https?:/.test(src)) return src;
  if (src.startsWith("/images/")) return "/assets" + src;
  const name = basename(src);
  if (imageBase) {
    env.images.add(name);
    return `/assets/posts/${imageBase}/${name}`;
  }
  return src;
}

function fenceRaw(code, lang) {
  const runs = [...code.matchAll(/`+/g)].map((match) => match[0].length);
  const longest = runs.length > 0 ? Math.max(...runs) : 0;
  const fence = "`".repeat(Math.max(3, longest + 1));
  return `${fence}${lang}\n${code}\n${fence}`;
}

function renderFence(token) {
  const info = (token.info || "").trim();
  let lang = info.split(/\s+/)[0] || "";
  if (!/^[a-zA-Z0-9_+-]+$/.test(lang) || lang === "plain") lang = "";
  return fenceRaw(token.content.replace(/\n$/, ""), lang);
}

function renderTokens(tokens, env, imageBase) {
  let out = "";
  const listStack = [];
  let listDepth = 0;
  let table = null;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    switch (token.type) {
      case "heading_open":
        out += "\n" + "=".repeat(Number(token.tag.slice(1))) + " ";
        break;
      case "heading_close": out += "\n\n"; break;
      case "paragraph_open": {
        const inline = tokens[i + 1];
        const raw = inline && inline.type === "inline" ? inline.content.trim() : "";
        const match = raw.match(/^ZZPH(\d+)ZZ$/);
        if (match) { out += env.blocks[Number(match[1])] + "\n\n"; i += 2; }
        break;
      }
      case "paragraph_close": out += listDepth > 0 ? "" : "\n\n"; break;
      case "inline":
        if (table && table.cell) table.cell.text += renderInline(token.children, env, imageBase);
        else out += renderInline(token.children, env, imageBase);
        break;
      case "fence": out += renderFence(token, env, imageBase) + "\n\n"; break;
      case "code_block":
        out += fenceRaw(token.content.replace(/\n$/, ""), "") + "\n\n";
        break;
      case "blockquote_open": out += "#quote-block[\n"; break;
      case "blockquote_close": out += "\n]\n\n"; break;
      case "bullet_list_open": listStack.push("- "); listDepth++; break;
      case "bullet_list_close": listStack.pop(); listDepth--; out += "\n"; break;
      case "ordered_list_open": listStack.push("+ "); listDepth++; break;
      case "ordered_list_close": listStack.pop(); listDepth--; out += "\n"; break;
      case "list_item_open": out += (out.endsWith("\n") || out === "" ? "" : "\n") + "  ".repeat(Math.max(0, token.level - 1)) + (listStack[listStack.length - 1] ?? "- "); break;
      case "list_item_close": out += "\n"; break;
      case "hr": out += '#hr-line()\n\n'; break;
      case "table_open": table = { rows: [], current: null, cell: null }; break;
      case "tr_open": if (table) table.current = []; break;
      case "tr_close": if (table && table.current) table.rows.push(table.current); break;
      case "th_open":
      case "td_open": if (table) table.cell = { text: "", head: token.type === "th_open" }; break;
      case "th_close":
      case "td_close": if (table && table.cell && table.current) table.current.push(table.cell); table && (table.cell = null); break;
      case "table_close": {
        if (table) {
          const cols = table.rows[0]?.length || 1;
          const cells = table.rows
            .map((row) => row.map((cell) => `  [${cell.head ? `*${cell.text}*` : cell.text}],`).join("\n"))
            .join("\n");
          out += `#table(\n  columns: ${cols},\n${cells}\n)\n\n`;
          table = null;
        }
        break;
      }
      default: break;
    }
  }
  return out;
}

function render(frontmatter, body) {
  const env = { blocks: [], inline: [], images: new Set() };
  const slug = basename(frontmatter.__file, extname(frontmatter.__file)) === "index"
    ? basename(dirname(frontmatter.__file))
    : basename(frontmatter.__file, extname(frontmatter.__file));
  const imageBase = frontmatter.__images ? slug : null;
  const typstBody = convertBody(body, env, imageBase);

  const stats = readingStats(body);
  const tags = Array.isArray(frontmatter.tags) ? frontmatter.tags : [];
  const tagItems = tags.map((t) => `"${escapeString(String(t))}"`);
  const tagList = tagItems.length === 1 ? `${tagItems[0]},` : tagItems.join(", ");
  const summary = frontmatter.description ?? "";
  const lines = [
    `#import "/templates/fuwari.typ": post, admonition, quote-block, github-card, link-card, content-image, hr-line, anchor`,
    "",
    "#show: post.with(",
    `  title: "${escapeString(frontmatter.title ?? slug)}",`,
    `  date: "${frontmatter.published ?? "1970-01-01"}",`,
    ...(frontmatter.updated ? [`  update: "${frontmatter.updated}",`] : []),
    `  summary: "${escapeString(summary)}",`,
    `  tags: (${tagList}),`,
    frontmatter.category ? `  category: "${escapeString(frontmatter.category)}",` : `  category: none,`,
    frontmatter.image ? `  image: "${escapeString(frontmatter.image)}",` : `  image: none,`,
    `  draft: ${frontmatter.draft === true || frontmatter.draft === "true" ? "true" : "false"},`,
    ")",
    "",
    typstBody.trim(),
    "",
  ];
  const tidy = (text) => text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+$/gm, "").trim() + "\n";
  return { slug, source: tidy(lines.join("\n")), env, stats };
}

function main() {
  mkdirSync(OUT, { recursive: true });
  for (const rel of POSTS) {
    const src = join(SOURCE, rel);
    if (!existsSync(src)) { console.warn("missing:", rel); continue; }
    const raw = readFileSync(src, "utf8");
    const { data, body } = parseFrontmatter(raw);
    const dir = dirname(src);
    const hasLocalImages = readdirSync(dir).some((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
    data.__file = rel;
    data.__images = hasLocalImages;

    const rendered = render(data, body);
    const outPath = join(OUT, `${rendered.slug}.typ`);
    writeFileSync(outPath, rendered.source);
    console.log("wrote", outPath.replace(root + "/", ""), "images:", [...rendered.env.images].join(",") || "-");

    if (hasLocalImages) {
      const dest = join(ASSET_OUT, rendered.slug);
      mkdirSync(dest, { recursive: true });
      for (const file of readdirSync(dir)) {
        if (file === "index.md") continue;
        if (statSync(join(dir, file)).isDirectory()) continue;
        copyFileSync(join(dir, file), join(dest, file));
      }
    }
  }
}

main();
