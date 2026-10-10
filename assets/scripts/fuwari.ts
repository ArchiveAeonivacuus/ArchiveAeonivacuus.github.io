import Swup from "swup";
import { closePanels, mountSettings } from "./settings";
import { mountSearch } from "./search";
import { mountScroll } from "./scroll";
import { mountToc } from "./toc";
import { mountComments } from "./comments";
import { mountLightbox } from "./lightbox";
import { mountCodeCopy } from "./copy";
import { mountArchiveFilter } from "./filter";
import { syncDataHrefs } from "./links";
import { mountGithubCards } from "./github";
import { applyI18n } from "./i18n";
import { cleanupPage } from "./lifecycle";
import { mountMermaid } from "./mermaid";

function syncBodyState(): void {
  document.documentElement.classList.toggle("is-home", location.pathname === "/" || location.pathname === "");
  document.querySelector("#navbar-wrapper")?.classList.remove("navbar-hidden");
  document.querySelector("#back-to-top-btn")?.classList.add("hide");
}

function mountPage(): void {
  syncBodyState();
  syncDataHrefs();
  applyI18n();
  mountToc();
  mountCodeCopy();
  mountLightbox();
  mountComments();
  mountArchiveFilter();
  mountGithubCards();
  mountMermaid();
}

function mountGlobal(): void {
  document.querySelector("#banner")?.classList.add("is-ready");
  syncDataHrefs();
  mountSettings();
  mountSearch();
  mountScroll();
}

function setupSwup(): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Fall back to normal navigation when motion is reduced.
    return;
  }
  let swup: Swup;
  try {
    swup = new Swup({
      containers: ["#swup-container", "#toc"],
      animateHistoryBrowsing: true,
    });
  } catch {
    return;
  }

  swup.hooks.on("visit:start", () => {
    document.documentElement.style.setProperty("--content-delay", "0ms");
    closePanels();
    cleanupPage();
  });
  swup.hooks.on("page:view", () => {
    mountPage();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => { mountGlobal(); mountPage(); setupSwup(); }, { once: true });
} else {
  mountGlobal();
  mountPage();
  setupSwup();
}
