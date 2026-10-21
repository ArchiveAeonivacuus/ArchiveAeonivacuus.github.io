let initialized = false;
let mermaidPromise: Promise<any> | null = null;

function isDark(): boolean {
  return document.documentElement.classList.contains("dark");
}

// Lazily load the ~3.3MB mermaid bundle only when the page actually contains
// mermaid diagrams, instead of shipping it on every page.
function loadMermaid(): Promise<any> {
  if (!mermaidPromise) {
    mermaidPromise = new Promise((resolve, reject) => {
      const existing = (window as any).mermaid;
      if (existing) return resolve(existing);
      const script = document.createElement("script");
      script.src = "/assets/scripts/mermaid.min.js";
      script.async = true;
      script.onload = () => resolve((window as any).mermaid);
      script.onerror = () => reject(new Error("mermaid failed to load"));
      document.head.appendChild(script);
    });
  }
  return mermaidPromise;
}

export function mountMermaid(): void {
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>(".markdown-content pre.mermaid"),
  );
  if (nodes.length === 0) return;

  void loadMermaid()
    .then((mermaid) => {
      if (!mermaid) return;
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
    })
    .catch(() => {
      // Leave the raw code blocks in place if mermaid fails to load.
    });
}
