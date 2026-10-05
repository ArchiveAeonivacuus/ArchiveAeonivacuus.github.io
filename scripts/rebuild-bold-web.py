#!/usr/bin/env python3
"""Regenerate the bold web subsets so they cover every character the matching
regular faces cover.

UI chrome is often bold (nav labels, widget titles, the "下载 PDF" button), so a
bold subset limited to headings/strong text falls back for other characters.
This rebuilds the bold sources from the full bold fonts in `fonts-pdf/`, using
the regular face's character set. Run `scripts/shard-fonts.py` afterwards.

Usage:
    python3 scripts/rebuild-bold-web.py
"""

import glob
import hashlib
import os

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

SRC_DIR = "fonts-web-src"

# bold stem -> (full bold font, regular stem whose charset to mirror)
BOLD = {
    "source-han-serif-sc-700-normal": (
        "fonts-pdf/NotoSerifSC-Bold.otf",
        "source-han-serif-sc-400-normal",
    ),
    "source-han-serif-jp-700-normal": (
        # No separate JP bold in fonts-pdf; SC bold shares the design/coverage.
        "fonts-pdf/NotoSerifSC-Bold.otf",
        "source-han-serif-jp-400-normal",
    ),
}


def cmap_unicodes(path):
    font = TTFont(path, lazy=True)
    cps = set()
    for table in font["cmap"].tables:
        cps.update(table.cmap.keys())
    font.close()
    return sorted(cps)


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
    font.recalcBBoxes = False  # keep CJK glyph positions intact
    font.save(out)
    font.close()


for stem, (full, regular_stem) in BOLD.items():
    regular = glob.glob(os.path.join(SRC_DIR, f"{regular_stem}.*.woff2"))
    if not regular:
        print(f"!! missing regular source: {regular_stem}")
        continue
    unicodes = cmap_unicodes(regular[0])
    tmp = os.path.join(SRC_DIR, f"{stem}.tmp.woff2")
    subset(full, unicodes, tmp)
    with open(tmp, "rb") as handle:
        digest = hashlib.sha1(handle.read()).hexdigest()[:8]
    final = os.path.join(SRC_DIR, f"{stem}.{digest}.woff2")
    os.replace(tmp, final)
    for old in glob.glob(os.path.join(SRC_DIR, f"{stem}.*.woff2")):
        if old != final:
            os.remove(old)
    print(f"{stem}: {len(unicodes)} chars -> {os.path.basename(final)}")
