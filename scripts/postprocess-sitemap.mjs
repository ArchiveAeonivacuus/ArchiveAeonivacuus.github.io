// Post-process Tola's sitemap:
//  - drop the /404/ entry
//  - fill in a build-date `lastmod` for entries without one
//  - emit a sitemap index that references the urlset
// Usage: node scripts/postprocess-sitemap.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sitemapPath = join(root, "public", "sitemap.xml");
const indexPath = join(root, "public", "sitemap-index.xml");

const config = readFileSync(join(root, "tola.toml"), "utf8");
const site = (config.match(/^\s*url\s*=\s*"([^"]+)"/m)?.[1] ?? "").replace(/\/+$/, "");
const today = new Date().toISOString().slice(0, 10);

const xml = readFileSync(sitemapPath, "utf8");
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);

const kept = entries.filter((entry) => !/\/404\/<\/loc>/.test(entry));
const normalized = kept.map((entry) =>
  /<lastmod>/.test(entry) ? entry : entry.replace(/<\/loc>/, `</loc><lastmod>${today}</lastmod>`),
);

const header = '<?xml version="1.0" encoding="UTF-8"?>';
const urlset = `${header}\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${normalized
  .map((entry) => `  <url>${entry}</url>`)
  .join("\n")}\n</urlset>\n`;
writeFileSync(sitemapPath, urlset);

const index = `${header}\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <sitemap><loc>${site}/sitemap.xml</loc><lastmod>${today}</lastmod></sitemap>\n</sitemapindex>\n`;
writeFileSync(indexPath, index);

console.log(`[sitemap] ${normalized.length} urls, removed ${entries.length - kept.length}`);
