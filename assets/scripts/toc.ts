import { register } from "./lifecycle";

// Match the original site: the table of contents shows `minLevel` plus one
// deeper level (siteConfig.toc.depth = 2).
const MAX_LEVELS = 2;

function slugify(text: string): string {
  return text
    .trim()
    .toLocaleLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]+/gu, "")
    .replace(/^-+|-+$/g, "");
}

export function mountToc(): void {
  const wrapper = document.querySelector<HTMLElement>("#toc");
  const list = document.querySelector<HTMLElement>("#toc .toc-list");
  if (!wrapper || !list) return;

  const headings = Array.from(
    document.querySelectorAll<HTMLElement>(".markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4"),
  ).filter((heading) => (heading.textContent ?? "").trim() !== "");

  list.replaceChildren();
  if (headings.length === 0) {
    wrapper.classList.add("toc-empty");
    return;
  }
  wrapper.classList.remove("toc-empty");

  const minLevel = Math.min(...headings.map((heading) => Number(heading.tagName.slice(1))));
  const used = new Set<string>();
  const entries: Array<{ el: HTMLElement; link: HTMLAnchorElement }> = [];
  let topLevelIndex = 0;

  for (const heading of headings) {
    const depth = Number(heading.tagName.slice(1));
    if (depth >= minLevel + MAX_LEVELS) continue;

    const base = heading.id || slugify(heading.textContent ?? "") || "section";
    let id = base;
    let counter = 1;
    while (used.has(id)) id = `${base}-${counter++}`;
    used.add(id);
    heading.id = id;

    const level = Math.min(3, depth - minLevel + 1);
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.className = `toc-link toc-level-${level}`;

    const badge = document.createElement("div");
    badge.className = `toc-badge toc-badge-${level}`;
    if (level === 1) badge.textContent = String(++topLevelIndex);

    const label = document.createElement("div");
    label.className = "toc-label";
    label.textContent = (heading.textContent ?? "").trim();

    link.append(badge, label);
    list.append(link);
    entries.push({ el: heading, link });
  }

  const indicator = document.createElement("div");
  indicator.className = "toc-indicator";
  list.prepend(indicator);

  const scroller = list.parentElement as HTMLElement | null;

  const update = (): void => {
    let activeIndex = -1;
    for (let i = 0; i < entries.length; i++) {
      const candidate = entries[i];
      if (candidate && candidate.el.getBoundingClientRect().top <= window.innerHeight * 0.28) activeIndex = i;
    }
    if (activeIndex < 0) {
      indicator.style.opacity = "0";
      return;
    }
    const entry = entries[activeIndex];
    if (!entry) {
      indicator.style.opacity = "0";
      return;
    }
    const { link } = entry;
    indicator.style.opacity = "1";
    indicator.style.top = `${link.offsetTop}px`;
    indicator.style.height = `${link.offsetHeight}px`;

    if (!scroller) return;
    const top = link.offsetTop;
    const bottom = top + link.offsetHeight;
    const viewTop = scroller.scrollTop;
    const viewBottom = viewTop + scroller.clientHeight;
    if (top < viewTop + 16) scroller.scrollTo({ top: Math.max(0, top - 16), behavior: "smooth" });
    else if (bottom > viewBottom - 16) scroller.scrollTo({ top: bottom - scroller.clientHeight + 16, behavior: "smooth" });
  };

  const observer = new IntersectionObserver(update, { rootMargin: "-20% 0px -65% 0px" });
  entries.forEach((entry) => observer.observe(entry.el));
  update();
  register(() => observer.disconnect());

  // Let the scroll handler decide whether the TOC should be hidden yet.
  window.dispatchEvent(new Event("scroll"));
}
