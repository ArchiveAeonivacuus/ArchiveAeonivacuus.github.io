#!/usr/bin/env python3
"""Generate per-page font subsets and inline the @font-face rules into each page.

Instead of a global font stylesheet (or unicode-range shards, which a CJK page
mostly downloads anyway), every page ships only the glyphs it actually renders.
That keeps a page down to a handful of small font requests.

Requires `fonts-pdf/` (full fonts). Run after `tola build`, before the 404 copy.

Usage: python3 scripts/build-page-fonts.py
"""

import glob
import hashlib
import html
import io
import logging
import os
import re
from multiprocessing import Pool

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

# The "meta NOT subset" notice is printed for every subset; it is harmless.
logging.getLogger("fontTools").setLevel(logging.ERROR)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
FONTS = os.path.join(ROOT, "fonts-pdf")
OUT = os.path.join(PUBLIC, "assets", "pagefonts")

# css family -> {weight -> {style -> source file}}
FAMILIES = {
    "Source Han Serif SC": {
        400: {"normal": "NotoSerifSC-Regular.otf"},
        700: {"normal": "NotoSerifSC-Bold.otf"},
    },
    "Source Han Serif JP": {
        400: {"normal": "SourceHanSerifJP-Regular.otf"},
        # No separate JP bold available; SC bold shares the design.
        700: {"normal": "NotoSerifSC-Bold.otf"},
    },
    "Source Han Serif Old": {400: {"normal": "SourceHanSerifOld-Light.otf"}},
    "Asebi Mincho": {400: {"normal": "AsebiMin-Light.ttf"}},
    "KaiTi": {400: {"normal": "simkai.ttf"}},
    "DFKai-SB": {400: {"normal": "標楷體.ttf"}},
    "Old English Onglisch": {400: {"normal": "Old English Onglisch.ttf"}},
    "HighTowerText": {400: {"normal": "HTOWERT.TTF", "italic": "HTOWERTI.TTF"}},
    "Source Serif 4": {
        400: {"normal": "SourceSerif4-Regular.ttf", "italic": "SourceSerif4-Italic.ttf"},
        700: {"normal": "SourceSerif4-Bold.otf"},
    },
}

BODY_BY_LANG = {
    "": ["Source Han Serif SC", "Source Han Serif JP"],
    "zh_CN": ["Source Han Serif SC", "Source Han Serif JP"],
    "zh_TW": ["Source Han Serif SC", "Source Han Serif JP"],
    "ja": ["Source Han Serif JP", "Source Han Serif SC"],
    "en": ["Source Serif 4", "Source Han Serif SC", "Source Han Serif JP"],
    "ong": ["Old English Onglisch", "Source Serif 4", "Source Han Serif SC"],
    "A-zh_iang": ["Source Han Serif JP", "Source Han Serif SC"],
}

CLASS_FAMILY = {
    "ff-ja": "Source Han Serif JP",
    "ff-min": "Source Han Serif JP",
    "ff-ja_old": "Asebi Mincho",
    "ff-ong": "Old English Onglisch",
    "ff-en": "Source Serif 4",
    "ff-rom": "HighTowerText",
    "ff-zh_cn": "Source Han Serif SC",
    "ff-cjk_old": "Source Han Serif Old",
    "ff-dfkai": "DFKai-SB",
    "ff-kai": "KaiTi",
}

# Per-process caches (each worker keeps its own).
_sources = {}


def source_bytes(name):
    if name not in _sources:
        with open(os.path.join(FONTS, name), "rb") as handle:
            _sources[name] = handle.read()
    return _sources[name]


def source_cmap(name):
    key = "cmap:" + name
    if key not in _sources:
        font = TTFont(io.BytesIO(source_bytes(name)), lazy=True)
        _sources[key] = set(font.getBestCmap() or [])
        font.close()
    return _sources[key]


def page_chars(text):
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", text, flags=re.S | re.I)
    text = re.sub(r"<[^>]+>", "", text)
    return {ord(c) for c in html.unescape(text) if not c.isspace()}


def page_families(text, lang):
    families = set(BODY_BY_LANG.get(lang, BODY_BY_LANG[""]))
    classes = set()
    for match in re.finditer(r'class="([^"]*)"', text):
        classes.update(match.group(1).split())
    for name, family in CLASS_FAMILY.items():
        if name in classes:
            families.add(family)
    if {"poem", "ci", "spellcard"} & classes:
        families.add("KaiTi")
    if "waka" in classes:
        families.add("DFKai-SB")
    return families


def subset_file(family, weight, style, source, unicodes):
    font = TTFont(io.BytesIO(source_bytes(source)))
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
    buf = io.BytesIO()
    font.save(buf)
    font.close()
    payload = buf.getvalue()
    digest = hashlib.sha1(payload).hexdigest()[:10]
    slug = re.sub(r"[^a-z0-9]+", "-", family.lower()).strip("-")
    name = f"{slug}-{weight}-{style}-{digest}.woff2"
    with open(os.path.join(OUT, name), "wb") as handle:
        handle.write(payload)
    return name


def rules_for_family(family, unicodes):
    rules = []
    for weight, styles in FAMILIES[family].items():
        for style, source in styles.items():
            keep = sorted(c for c in unicodes if c in source_cmap(source))
            if not keep:
                continue
            name = subset_file(family, weight, style, source, keep)
            rules.append(
                "@font-face{font-family:'%s';font-weight:%d;font-style:%s;font-display:swap;"
                "src:url('/assets/pagefonts/%s')format('woff2')}" % (family, weight, style, name)
            )
    return rules


def process_page(path):
    with open(path, encoding="utf-8") as handle:
        text = handle.read()
    lang = (re.search(r'class="site-shell"[^>]*data-lang="([^"]*)"', text) or [None, ""])[1]
    chars = page_chars(text)
    rules = []
    for family in sorted(page_families(text, lang)):
        rules.extend(rules_for_family(family, chars))
    style_tag = "<style>" + "".join(rules) + "</style>"
    # Inject inside the Swup container (not <head>) so client-side navigation
    # swaps the @font-face rules together with the page content.
    out = re.sub(
        r'<main id="swup-container"[^>]*>',
        lambda m: m.group(0) + style_tag,
        text,
        count=1,
    )
    if out == text:
        out = re.sub(
            r'<link rel="stylesheet" href="/assets/styles/fonts\.css[^"]*"\s*/?>',
            style_tag,
            text,
            count=1,
        )
        if style_tag not in out:
            out = text.replace("</head>", style_tag + "</head>", 1)
    return path, out


def main():
    pages = glob.glob(os.path.join(PUBLIC, "**", "*.html"), recursive=True)
    if not pages:
        print("[pagefonts] no pages; run a Tola build first")
        return
    os.makedirs(OUT, exist_ok=True)
    for stale in glob.glob(os.path.join(OUT, "*.woff2")):
        os.remove(stale)

    workers = min(os.cpu_count() or 4, 8)
    with Pool(processes=workers) as pool:
        results = pool.map(process_page, pages)
    for path, text in results:
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(text)

    files = glob.glob(os.path.join(OUT, "*.woff2"))
    print(f"[pagefonts] {len(pages)} pages, {len(files)} subsets, {workers} workers")


if __name__ == "__main__":
    main()
