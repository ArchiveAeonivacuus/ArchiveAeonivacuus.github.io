let initialized = false;

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

export function mountMermaid(): void {
  const mermaid = (window as any).mermaid;
  if (!mermaid) return;

  const nodes = Array.from(document.querySelectorAll<HTMLElement>(".markdown-content pre.mermaid"));
  if (nodes.length === 0) return;

  if (!initialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: isDark() ? "dark" : "default",
      flowchart: { useMaxWidth: false, htmlLabels: true, diagramPadding: 240 },
    });
    initialized = true;
  }

  mermaid.run({ nodes });
}
