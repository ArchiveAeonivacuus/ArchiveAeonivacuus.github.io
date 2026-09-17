import { spawnSync } from "node:child_process";

const candidates = ["python3", "python", "py"];

function runSubset(py) {
  const result = spawnSync(py, ["scripts/font-subset.py"], { stdio: "inherit" });
  process.exit(result.status ?? 1);
}

function installFontTools(py) {
  const attempts = [
    ["-m", "pip", "install", "--quiet", "fonttools"],
    ["-m", "pip", "install", "--quiet", "--user", "fonttools"],
    ["-m", "pip", "install", "--quiet", "--break-system-packages", "fonttools"],
  ];
  for (const args of attempts) {
    const r = spawnSync(py, args, { stdio: "inherit" });
    if (r.status === 0) return true;
  }
  return false;
}

// 1. 用已装 fontTools 的 Python 直接跑
for (const py of candidates) {
  const probe = spawnSync(py, ["-c", "import fontTools"], { stdio: "ignore" });
  if (probe.status === 0) {
    runSubset(py);
  }
}

// 2. 没有就现场装一次 fontTools
for (const py of candidates) {
  const probe = spawnSync(py, ["--version"], { stdio: "ignore" });
  if (probe.status !== 0) continue;

  console.log(`Installing fonttools via ${py} ...`);
  if (installFontTools(py)) {
    runSubset(py);
  }
}

console.error(
  "No usable Python found. Install Python 3 and run: pip install fonttools",
);
process.exit(1);
