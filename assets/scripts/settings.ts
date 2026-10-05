type Theme = "light" | "dark" | "auto";

const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");
const themeSequence: Theme[] = ["light", "dark", "auto"];

const storage = {
  get(key: string, fallback: string): string {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
  },
  set(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch { /* Keep the current-session setting. */ }
  },
};

let theme = storage.get("theme", "auto") as Theme;
if (!themeSequence.includes(theme)) theme = "auto";

export function isDark(): boolean {
  return root.classList.contains("dark");
}

function applyTheme(value: Theme): void {
  root.classList.toggle("dark", value === "dark" || (value === "auto" && media.matches));
  root.dataset.theme = value;
  const button = document.querySelector<HTMLButtonElement>("#theme-toggle");
  if (button) button.title = `主题：${value}`;
  window.dispatchEvent(new Event("themechange"));
}

export function closePanels(except?: HTMLElement): void {
  document.querySelectorAll<HTMLElement>(".float-panel").forEach((panel) => {
    if (panel !== except) panel.classList.add("is-closed");
  });
  document.querySelectorAll<HTMLButtonElement>("[aria-expanded]").forEach((button) => {
    const controlled = button.id === "search-switch" ? "search-panel" : button.id === "display-settings-switch" ? "display-setting" : button.id === "nav-menu-switch" ? "nav-menu-panel" : "";
    if (!except || controlled !== except.id) button.setAttribute("aria-expanded", "false");
  });
}

function bindPanel(buttonSelector: string, panelSelector: string, focusSelector?: string): void {
  const button = document.querySelector<HTMLButtonElement>(buttonSelector);
  const panel = document.querySelector<HTMLElement>(panelSelector);
  if (!button || !panel) return;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = panel.classList.contains("is-closed");
    closePanels(willOpen ? panel : undefined);
    panel.classList.toggle("is-closed", !willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen && focusSelector) document.querySelector<HTMLInputElement>(focusSelector)?.focus();
  });
  panel.addEventListener("click", (event) => event.stopPropagation());
}

let mounted = false;

export function mountSettings(): void {
  applyTheme(theme);
  media.addEventListener("change", () => { if (theme === "auto") applyTheme(theme); });
  if (mounted) return;
  mounted = true;

  document.querySelector<HTMLButtonElement>("#theme-toggle")?.addEventListener("click", () => {
    theme = themeSequence[(themeSequence.indexOf(theme) + 1) % themeSequence.length] ?? "auto";
    storage.set("theme", theme);
    applyTheme(theme);
  });

  const slider = document.querySelector<HTMLInputElement>("#color-slider");
  const hue = storage.get("hue", "265");
  root.style.setProperty("--hue", hue);
  if (slider) {
    slider.value = hue;
    slider.addEventListener("input", () => {
      root.style.setProperty("--hue", slider.value);
      storage.set("hue", slider.value);
    });
  }

  bindPanel("#display-settings-switch", "#display-setting");
  bindPanel("#search-switch", "#search-panel", "#search-input");
  bindPanel("#nav-menu-switch", "#nav-menu-panel");

  document.addEventListener("click", () => closePanels());
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closePanels(); });
}
