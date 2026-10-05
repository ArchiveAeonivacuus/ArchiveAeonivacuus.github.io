// Generate a PDF for every content page by compiling it with the Typst CLI.
// The layouts branch on `target()`, so the same sources render to paged output.
// Usage: node scripts/build-pdf.mjs
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const outDir = join(root, "public");
const pkgPath = join(root, ".tola", "packages");
const fontDir = join(root, "fonts-pdf");
const fontArgs = existsSync(fontDir) ? ["--font-path", fontDir] : [];

// Site metadata for paged output comes from templates/site-info.json (generated
// by scripts/build-site-info.mjs), so the CLI build and the editor preview match.
// `--ignore-system-fonts` makes the PDF use only the vendored fonts-pdf/ set,
// matching Tinymist with `systemFonts: false`.

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...walk(full));
    else if (name.endsWith(".typ") && !name.startsWith("_")) files.push(full);
  }
  return files;
}

if (!existsSync(pkgPath)) {
  console.error(`[pdf] missing ${relative(root, pkgPath)}; run a Tola build first`);
  process.exit(1);
}

let ok = 0;
const files = walk(contentDir);
for (const file of files) {
  // Drafts are not published, so they get no PDF either.
  if (/draft:\s*true/.test(readFileSync(file, "utf8"))) continue;
  const rel = relative(contentDir, file).replace(/\.typ$/, "");
  const out = join(outDir, rel + ".pdf");
  mkdirSync(dirname(out), { recursive: true });
  try {
    execFileSync("typst", ["compile", "--package-path", pkgPath, "--root", root, "--ignore-system-fonts", ...fontArgs, file, out], { stdio: "pipe" });
    ok += 1;
  } catch (error) {
    const message = error.stderr?.toString().trim().split("\n").slice(0, 3).join(" ") ?? String(error);
    console.error(`[pdf] failed: ${rel} -> ${message}`);
  }
}
console.log(`[pdf] generated ${ok}/${files.length}`);
