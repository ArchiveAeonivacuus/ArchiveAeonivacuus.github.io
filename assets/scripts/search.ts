type PagefindRecord = {
  url: string;
  meta: { title?: string };
  excerpt?: string;
};

type PagefindResult = {
  data: () => Promise<PagefindRecord>;
};

type PagefindModule = {
  search: (query: string) => Promise<{ results: PagefindResult[] }>;
  options?: (options: Record<string, unknown>) => Promise<void>;
};

let pagefindPromise: Promise<PagefindModule | null> | null = null;

async function getPagefind(): Promise<PagefindModule | null> {
  if (!pagefindPromise) {
    pagefindPromise = (async () => {
      try {
        // Resolved at runtime so the bundler keeps it as a dynamic import.
        const url = "/pagefind/pagefind.js";
        const module = (await import(/* @vite-ignore */ url)) as unknown as PagefindModule;
        await module.options?.({ excerptLength: 30 });
        return module;
      } catch {
        return null;
      }
    })();
  }
  return pagefindPromise;
}

function appendResult(container: HTMLElement, title: string, href: string, excerpt?: string): void {
  const link = document.createElement("a");
  link.className = "search-result";
  link.href = href;
  const strong = document.createElement("strong");
  strong.textContent = title;
  link.append(strong);
  if (excerpt) {
    const small = document.createElement("small");
    small.innerHTML = excerpt;
    link.append(small);
  }
  container.append(link);
}

export function mountSearch(): void {
  const input = document.querySelector<HTMLInputElement>("#search-input");
  const desktopInput = document.querySelector<HTMLInputElement>("#desktop-search-input");
  const results = document.querySelector<HTMLElement>("#search-results");
  if (!input || !results) return;

  const panel = document.querySelector<HTMLElement>("#search-panel");
  let sequence = 0;
  let timer: number | undefined;

  const run = async (source: HTMLInputElement): Promise<void> => {
    if (source !== input) input.value = source.value;
    const query = source.value.trim();
    const current = ++sequence;
    results.replaceChildren();
    if (!query) return;

    const pagefind = await getPagefind();
    if (pagefind) {
      try {
        const response = await pagefind.search(query);
        const data = await Promise.all(response.results.slice(0, 8).map((item) => item.data()));
        if (current !== sequence) return;
        for (const item of data) appendResult(results, item.meta.title ?? item.url, item.url, item.excerpt);
        if (results.childElementCount > 0) panel?.classList.remove("is-closed");
        return;
      } catch {
        // Fall through to the in-document fallback below.
      }
    }

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".post-card h2 a"));
    for (const link of links.filter((item) => item.textContent?.toLocaleLowerCase().includes(query.toLocaleLowerCase())).slice(0, 8)) {
      appendResult(results, link.textContent?.trim() ?? link.href, link.href);
    }
    if (results.childElementCount > 0) panel?.classList.remove("is-closed");
  };

  const schedule = (source: HTMLInputElement): void => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { void run(source); }, 200);
  };

  input.addEventListener("input", () => schedule(input));
  desktopInput?.addEventListener("input", () => schedule(desktopInput));
  desktopInput?.addEventListener("focus", () => {
    if (desktopInput.value.trim()) panel?.classList.remove("is-closed");
  });
  panel?.addEventListener("click", (event) => {
    if ((event.target as HTMLElement).closest(".search-result")) panel.classList.add("is-closed");
  });
}
