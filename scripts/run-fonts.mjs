import { spawnSync } from "node:child_process";

const candidates = ["python3", "python", "py"];
let ran = false;

for (const py of candidates) {
  const probe = spawnSync(py, ["-c", "import fontTools"], {
    stdio: "ignore",
  });
  if (probe.status === 0) {
    ran = true;
    const result = spawnSync(py, ["scripts/font-subset.py"], {
      stdio: "inherit",
    });
    process.exit(result.status ?? 1);
  }
}

if (!ran) {
  console.error(
    "No usable Python with fontTools found. Install Python and run: pip install fonttools",
  );
  process.exit(1);
}
