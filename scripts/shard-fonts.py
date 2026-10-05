#!/usr/bin/env python3
"""Split the web font subsets into `unicode-range` chunks for lazy loading.

Sources live in `fonts-web-src/` (subsetted per face, tracked). The output goes
to `assets/webfonts/` and the generated CSS to `assets/styles/fonts.css`.

Usage:
    python3 scripts/shard-fonts.py
"""

import glob
import hashlib
import os
import re
from collections import Counter

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

SRC_DIR = "fonts-web-src"
OUT_DIR = "assets/webfonts"
CSS_PATH = "assets/styles/fonts.css"
TARGET_BYTES = 40 * 1024  # aim for ~40 KB per chunk

# Set FONT_CDN to serve the font files from a CDN, e.g.
#   FONT_CDN=https://cdn.jsdelivr.net/gh/<owner>/<repo>@<ref>/assets/webfonts
# Leave empty to serve them from the site origin (/assets/webfonts).
CDN_BASE = os.environ.get("FONT_CDN", "").rstrip("/")


def font_url(name):
    return f"{CDN_BASE}/{name}" if CDN_BASE else f"/assets/webfonts/{name}"


def collect_frequency():
    """Character frequency; prefer the rendered HTML, fall back to the sources."""
    freq = Counter()
    pages = glob.glob("public/**/*.html", recursive=True)
    if pages:
        for path in pages:
            with open(path, encoding="utf-8") as handle:
                text = re.sub(r"<[^>]+>", "", handle.read())
            freq.update(text)
        return freq
    for path in glob.glob("content/**/*.typ", recursive=True) + glob.glob("content/*.typ"):
        with open(path, encoding="utf-8") as handle:
            freq.update(handle.read())
    return freq


FREQ = collect_frequency()

# (source stem, css family, weight, style)
FACES = [
    ("source-han-serif-sc-400-normal", "Source Han Serif SC", 400, "normal"),
    ("source-han-serif-sc-700-normal", "Source Han Serif SC", 700, "normal"),
    ("source-han-serif-jp-400-normal", "Source Han Serif JP", 400, "normal"),
    ("source-han-serif-jp-700-normal", "Source Han Serif JP", 700, "normal"),
    ("source-han-serif-old-400-normal", "Source Han Serif Old", 400, "normal"),
    ("asebi-mincho-400-normal", "Asebi Mincho", 400, "normal"),
    ("kaiti-400-normal", "KaiTi", 400, "normal"),
    ("dfkai-sb-400-normal", "DFKai-SB", 400, "normal"),
    ("old-english-onglisch-400-normal", "Old English Onglisch", 400, "normal"),
    ("hightowertext-400-normal", "HighTowerText", 400, "normal"),
    ("hightowertext-400-italic", "HighTowerText", 400, "italic"),
    ("source-serif-4-400-normal", "Source Serif 4", 400, "normal"),
    ("source-serif-4-700-normal", "Source Serif 4", 700, "normal"),
    ("source-serif-4-400-italic", "Source Serif 4", 400, "italic"),
]


def cmap_unicodes(font):
    cps = set()
    for table in font["cmap"].tables:
        cps.update(table.cmap.keys())
    return sorted(cps)


def merge_ranges(cps):
    ranges = []
    start = prev = cps[0]
    for cp in cps[1:]:
        if cp == prev + 1:
            prev = cp
        else:
            ranges.append((start, prev))
            start = prev = cp
    ranges.append((start, prev))
    return ranges


def fmt_ranges(ranges):
    return ", ".join(f"U+{a:X}" if a == b else f"U+{a:X}-{b:X}" for a, b in ranges)


def subset(src, unicodes, out):
    font = TTFont(src)
    options = Options()
    options.flavor = "woff2"
    options.desubroutinize = True
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.no_hinting = True
    options.notdef_outline = True
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=unicodes)
    subsetter.subset(font)
    font.flavor = "woff2"
    # Critical: fontTools recomputes composite-glyph bounding boxes and gets it
    # wrong for simkai / 標楷體, shifting CJK glyphs sideways. Must stay off.
    font.recalcBBoxes = False
    font.save(out)
    font.close()


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for name in glob.glob(os.path.join(OUT_DIR, "*.woff2")):
        os.remove(name)

    rules = []
    total_files = 0
    for stem, family, weight, style in FACES:
        matches = glob.glob(os.path.join(SRC_DIR, f"{stem}.*.woff2"))
        if not matches:
            print(f"!! missing source: {stem}")
            continue
        src = matches[0]
        font = TTFont(src, lazy=True)
        cps = sorted(cmap_unicodes(font), key=lambda cp: (-FREQ.get(chr(cp), 0), cp))
        font.close()
        per_char = os.path.getsize(src) / max(1, len(cps))
        chunk = max(1, int(TARGET_BYTES / per_char))
        groups = [cps[i : i + chunk] for i in range(0, len(cps), chunk)]
        for index, group in enumerate(groups):
            tmp = os.path.join(OUT_DIR, f"{stem}.{index}.tmp.woff2")
            subset(src, group, tmp)
            with open(tmp, "rb") as handle:
                digest = hashlib.sha1(handle.read()).hexdigest()[:8]
            name = f"{stem}.{index}.{digest}.woff2"
            os.replace(tmp, os.path.join(OUT_DIR, name))
            total_files += 1
            rules.append(
                {
                    "family": family,
                    "weight": weight,
                    "style": style,
                    "url": font_url(name),
                    "range": fmt_ranges(merge_ranges(group)) if len(groups) > 1 else None,
                }
            )
        print(f"{family} {weight} {style}: {len(groups)} chunks, {len(cps)} chars")

    lines = [
        "/* Web fonts: subsetted per face and split into unicode-range chunks for",
        "   lazy loading (regenerate with scripts/shard-fonts.py). */",
        "",
    ]
    for rule in rules:
        css = (
            f"@font-face {{ font-family: '{rule['family']}'; font-weight: {rule['weight']};"
            f" font-style: {rule['style']}; font-display: swap;"
            f" src: url('{rule['url']}') format('woff2');"
        )
        if rule["range"]:
            css += f" unicode-range: {rule['range']};"
        css += " }"
        lines.append(css)
    with open(CSS_PATH, "w") as handle:
        handle.write("\n".join(lines) + "\n")
    print(f"wrote {CSS_PATH}: {len(rules)} rules, {total_files} font files")


if __name__ == "__main__":
    main()
