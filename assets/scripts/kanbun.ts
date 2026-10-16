export function mountKanbun(): void {
  const convert = (window as any).convertKanbunDiv;
  if (typeof convert !== "function") return;

  const divs = Array.from(
    document.querySelectorAll<HTMLElement>(".kanbun:not(.kanbun-converted)"),
  );
  for (const div of divs) {
    try {
      convert(div);
      div.classList.add("kanbun-converted");
    } catch {
      // A single failing conversion must not block the rest.
    }
  }
}
