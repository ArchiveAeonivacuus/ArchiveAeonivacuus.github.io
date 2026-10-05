// Tola normalizes `href` and drops query strings, but preserves `data-*`
// attributes. Links that need query parameters carry the real URL in
// `data-href`; this copies it back to `href` so navigation keeps the query.
export function syncDataHrefs(): void {
  document.querySelectorAll<HTMLAnchorElement>("a[data-href]").forEach((link) => {
    const target = link.dataset.href;
    if (target) link.setAttribute("href", target);
  });
}
