export function mountArchiveFilter(): void {
  const page = document.querySelector<HTMLElement>(".archive-page");
  if (!page) return;

  const params = new URLSearchParams(location.search);
  const tags = params.getAll("tag");
  const categories = params.getAll("category");
  const uncategorized = params.has("uncategorized");
  const isFiltered = tags.length > 0 || categories.length > 0 || uncategorized;
  const items = Array.from(page.querySelectorAll<HTMLElement>(".archive-item"));

  for (const item of items) {
    const itemTags = (item.dataset.tags ?? "").split(" ").filter(Boolean);
    const itemCategory = item.dataset.category ?? "";
    let show = true;
    if (tags.length > 0) show = tags.some((tag) => itemTags.includes(tag));
    if (show && categories.length > 0) show = categories.includes(itemCategory);
    if (show && uncategorized) show = itemCategory === "";
    item.classList.toggle("is-hidden", !show);
  }

  for (const group of Array.from(page.querySelectorAll<HTMLElement>(".archive-group"))) {
    const visible = group.querySelectorAll(".archive-item:not(.is-hidden)").length;
    group.classList.toggle("is-hidden", visible === 0);
    const count = group.querySelector<HTMLElement>(".archive-count");
    if (count) count.textContent = `${visible} 篇文章`;
  }

  page.querySelector(".archive-filter")?.remove();
  if (isFiltered) {
    const bar = document.createElement("div");
    bar.className = "archive-filter";
    const label = document.createElement("span");
    label.textContent = `筛选：${[...tags.map((tag) => `#${tag}`), ...categories, uncategorized ? "未分类" : ""].filter(Boolean).join(" ")}`;
    const clear = document.createElement("a");
    clear.href = "/archive/";
    clear.textContent = "清除";
    bar.append(label, clear);
    page.prepend(bar);
  }
}
