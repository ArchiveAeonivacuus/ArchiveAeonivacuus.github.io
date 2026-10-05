import { isDark } from "./settings";

const REPO = "ArchiveAeonivacuus/ArchiveAeonivacuus.github.io";
const REPO_ID = "R_kgDOQb_VFw";
const CATEGORY = "Announcements";
const CATEGORY_ID = "DIC_kwDOQb_VF84Cy0te";

function giscusTheme(): string {
  return isDark() ? "dark" : "light";
}

export function updateCommentsTheme(): void {
  const frame = document.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
  frame?.contentWindow?.postMessage({ giscus: { setConfig: { theme: giscusTheme() } } }, "https://giscus.app");
}

let themeObserver: MutationObserver | null = null;

function observeTheme(): void {
  if (themeObserver) return;
  themeObserver = new MutationObserver(updateCommentsTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.addEventListener("themechange", updateCommentsTheme);
}

export function mountComments(): void {
  observeTheme();
  const container = document.querySelector<HTMLElement>("#comments");
  if (!container) return;
  container.querySelector("script[src*='giscus']")?.remove();

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.async = true;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-repo", REPO);
  script.setAttribute("data-repo-id", REPO_ID);
  script.setAttribute("data-category", CATEGORY);
  script.setAttribute("data-category-id", CATEGORY_ID);
  script.setAttribute("data-mapping", "title");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "0");
  script.setAttribute("data-input-position", "top");
  script.setAttribute("data-theme", giscusTheme());
  script.setAttribute("data-lang", "zh-CN");
  script.setAttribute("data-loading", "lazy");
  container.append(script);
}
