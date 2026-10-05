function bannerPageHeight(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--banner-page").trim();
  const value = Number.parseFloat(raw);
  return raw.includes("vh") ? (window.innerHeight * value) / 100 : value;
}

export function mountScroll(): void {
  const topButton = document.querySelector<HTMLButtonElement>("#back-to-top-btn");
  const navbar = document.querySelector<HTMLElement>("#navbar-wrapper");

  const update = (): void => {
    const visibleBanner = bannerPageHeight();
    topButton?.classList.toggle("hide", window.scrollY < visibleBanner);
    navbar?.classList.toggle("navbar-hidden", window.scrollY > Math.max(80, visibleBanner - 120));
    document.querySelector<HTMLElement>("#toc.toc-wrapper")?.classList.toggle("toc-hide", window.scrollY < visibleBanner);
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  update();
}
