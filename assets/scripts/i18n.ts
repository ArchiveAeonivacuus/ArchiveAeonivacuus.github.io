import table from "../../templates/i18n.json";
import words from "../../templates/words.json";

// The navbar / sidebar live outside the Swup container, so after a client-side
// navigation their text stays in the previous page's language. This module
// re-labels `[data-i18n]` / `[data-i18n-placeholder]` / `[data-i18n-aria]`
// elements and re-renders `[data-word]` dictionary labels (which may contain
// Japanese ruby) using the language of the page now in `#swup-container`.

type LangTable = Record<string, Record<string, string>>;

const data = table as LangTable;
const wordData = words as LangTable;

const aliases: Record<string, string> = {
  zh: "zh_CN",
  "zh-hans": "zh_CN",
  "zh-cn": "zh_CN",
  "zh-tw": "zh_TW",
  en_us: "en",
  en_gb: "en",
  ong: "A_ong",
  "a-ong": "A_ong",
  a_zh_iang: "A_zh_iang",
  "a-zh-iang": "A_zh_iang",
  "a-zh_iang": "A_zh_iang",
  zh_iang: "A_zh_iang",
};

function resolveKey(lang: string | null | undefined): string {
  const raw = lang && lang.trim() !== "" ? lang : "zh_CN";
  return aliases[raw] ?? raw;
}

export function applyI18n(): void {
  const main = document.querySelector<HTMLElement>("#swup-container");
  // The whole page (chrome included) follows the article language font.
  const shell = document.querySelector<HTMLElement>(".site-shell");
  if (shell) shell.dataset.lang = main?.dataset.pageLang ?? "";
  const key = resolveKey(main?.dataset.pageLang);
  const t = data[key] ?? data.zh_CN ?? {};

  document.querySelectorAll<HTMLElement>("[data-i18n]").forEach((el) => {
    const id = el.dataset.i18n;
    if (id && t[id]) el.textContent = t[id];
  });

  document.querySelectorAll<HTMLInputElement>("[data-i18n-placeholder]").forEach((el) => {
    const id = el.dataset.i18nPlaceholder;
    if (id && t[id]) el.placeholder = t[id];
  });

  document.querySelectorAll<HTMLElement>("[data-i18n-aria]").forEach((el) => {
    const id = el.dataset.i18nAria;
    if (id && t[id]) el.setAttribute("aria-label", t[id]);
  });

  document.querySelectorAll<HTMLElement>("[data-word]").forEach((el) => {
    const term = el.dataset.word;
    if (!term) return;
    const entry = wordData[term];
    const html = entry ? entry[key] ?? entry.zh_CN : undefined;
    if (html) el.innerHTML = html;
  });
}
