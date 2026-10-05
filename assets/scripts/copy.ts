import { register } from "./lifecycle";

const COPY_LABEL = "复制";
const DONE_LABEL = "已复制";

export function mountCodeCopy(): void {
  const blocks = Array.from(document.querySelectorAll<HTMLElement>(".markdown-content pre"));
  if (blocks.length === 0) return;

  const cleanups: Array<() => void> = [];

  for (const pre of blocks) {
    if (pre.dataset.copyReady === "true") continue;
    pre.dataset.copyReady = "true";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-btn";
    button.setAttribute("aria-label", COPY_LABEL);
    const label = document.createElement("span");
    label.className = "copy-label";
    label.textContent = COPY_LABEL;
    button.append(label);

    let timer: number | undefined;
    const onClick = async (): Promise<void> => {
      const code = pre.querySelector("code")?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        // Clipboard may be unavailable; keep the button state to signal the attempt.
      }
      button.classList.add("success");
      label.textContent = DONE_LABEL;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        button.classList.remove("success");
        label.textContent = COPY_LABEL;
      }, 1200);
    };

    button.addEventListener("click", onClick);
    pre.append(button);
    cleanups.push(() => {
      window.clearTimeout(timer);
      button.removeEventListener("click", onClick);
      button.remove();
    });
  }

  register(() => cleanups.forEach((cleanup) => cleanup()));
}
