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
import json
import logging
import os
import re
import shutil
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
        300: {"normal": "SourceHanSerifSC-Light.otf"},
        400: {"normal": "SourceHanSerifSC-Regular.otf"},
        500: {"normal": "SourceHanSerifSC-Medium.otf"},
        700: {"normal": "SourceHanSerifSC-Bold.otf"},
    },
    "Source Han Serif JP": {
        300: {"normal": "SourceHanSerifJP-Light.otf"},
        400: {"normal": "SourceHanSerifJP-Regular.otf"},
        500: {"normal": "SourceHanSerifJP-Medium.otf"},
        700: {"normal": "SourceHanSerifJP-Bold.otf"},
    },
    "Source Han Serif KR": {
        300: {"normal": "SourceHanSerifKR-Light.otf"},
        400: {"normal": "SourceHanSerifKR-Regular.otf"},
        500: {"normal": "SourceHanSerifKR-Medium.otf"},
        700: {"normal": "SourceHanSerifKR-Bold.otf"},
    },
    "Source Han Serif TC": {
        300: {"normal": "SourceHanSerifTC-Light.otf"},
        400: {"normal": "SourceHanSerifTC-Regular.otf"},
        500: {"normal": "SourceHanSerifTC-Medium.otf"},
        700: {"normal": "SourceHanSerifTC-Bold.otf"},
    },
    "Source Han Serif C": {
        300: {"normal": "SourceHanSerifC-Light.otf"},
        400: {"normal": "SourceHanSerifC-Regular.otf"},
        500: {"normal": "SourceHanSerifC-Medium.otf"},
        700: {"normal": "SourceHanSerifC-Bold.otf"},
    },
    "Asebi Mincho": {400: {"normal": "AsebiMin-Light.ttf"}},
    "KaiTi": {400: {"normal": "simkai.ttf"}},
    "LXGW WenKai": {
        400: {"normal": "LXGWWenKai-Regular.ttf"},
        700: {"normal": "LXGWWenKai-Bold.ttf"},
    },
    "Old English Onglisch": {400: {"normal": "Old English Onglisch.otf"}},
    "HighTowerText": {400: {"normal": "HTOWERT.TTF", "italic": "HTOWERTI.TTF"}},
    "Source Serif 4": {
        400: {"normal": "SourceSerif4-Regular.ttf", "italic": "SourceSerif4-Italic.ttf"},
        700: {"normal": "SourceSerif4-Bold.otf"},
    },
    "Times New Roman": {
        400: {"normal": "Times New Roman.TTF", "italic": "Times New Roman I.TTF"},
        700: {"normal": "Times New Roman B.TTF", "italic": "Times New Roman BI.TTF"},
    },
    "Amiri": {
        400: {"normal": "Amiri-Regular.ttf", "italic": "Amiri-Italic.ttf"},
        700: {"normal": "Amiri-Bold.ttf", "italic": "Amiri-BoldItalic.ttf"},
    },
}

BODY_BY_LANG = {
    "": ["Source Serif 4", "Source Han Serif SC", "Source Han Serif JP"],
    "zh_CN": ["Source Serif 4", "Source Han Serif SC", "Source Han Serif JP"],
    "zh_TW": ["Source Serif 4", "Source Han Serif TC", "Source Han Serif SC"],
    "ja": ["Source Serif 4", "Source Han Serif JP", "Source Han Serif SC"],
    "ko": ["Source Serif 4", "Source Han Serif KR", "Source Han Serif SC"],
    "en": ["Source Serif 4", "Source Han Serif SC", "Source Han Serif JP"],
    "ar": ["Amiri", "Source Serif 4", "Source Han Serif SC"],
    "ong": ["Old English Onglisch", "Source Serif 4", "Source Han Serif SC"],
    "A-zh_iang": ["Source Serif 4", "Source Han Serif JP", "Source Han Serif SC"],
}

CLASS_FAMILY = {
    "ff-ja": "Source Han Serif JP",
    "ff-kr": "Source Han Serif KR",
    "ff-min": "Source Han Serif JP",
    "ff-ja_old": "Asebi Mincho",
    "ff-ong": "Old English Onglisch",
    "ff-en": "Times New Roman",
    "ff-ar": "Amiri",
    "ff-rom": "HighTowerText",
    "ff-zh_cn": "Source Han Serif SC",
    "ff-zh_tw": "Source Han Serif TC",
    "ff-cjk_old": "Source Han Serif C",
    "ff-lxgw": "LXGW WenKai",
    "ff-kai": "KaiTi",
    "kanbun": "Source Han Serif JP",
}

# Language switcher labels (templates/post.typ `data-lang`) use each language's
# own page font, so those faces must be subset as well.
SWITCHER_LANG_FAMILY = {
    "zh_CN": "Source Han Serif SC",
    "zh_TW": "Source Han Serif TC",
    "ja": "Source Han Serif JP",
    "en": "Source Serif 4",
    "ko": "Source Han Serif KR",
    "ar": "Amiri",
    "ong": "Old English Onglisch",
    "A-zh_iang": "Source Han Serif JP",
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
    # CSS pseudo-elements such as MH card labels render from attributes, so the
    # characters are not present in the stripped text. Include data-label values.
    attribute_text = " ".join(
        re.findall(r'data-label\s*=\s*["\']([^"\']*)["\']', text, flags=re.I)
    )
    text = re.sub(r"<[^>]+>", "", text)
    text = html.unescape(attribute_text + " " + text)
    return {ord(c) for c in text if not c.isspace()}


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
        families.add("LXGW WenKai")
    for match in re.finditer(r'data-lang="([^"]*)"', text):
        family = SWITCHER_LANG_FAMILY.get(match.group(1))
        if family:
            families.add(family)
    return families


_LEXICON_CACHE = None

# Text created by lexicon.ts at runtime. It is not present in the static HTML,
# so include it explicitly for complete search/hint/button glyph coverage.
LEXICON_UI_TEXT = """
全部字段
全部
字段
排序
搜索字段
排序方式
按词性筛选
搜索词形、读音、释义或注释…
搜索词表
清空搜索
按 / 键跳到搜索框；点击词条查看详情
共 找到 条 第 页
词条 词形 词性 注释
词形 A → Z
词形 Z → A
词形长度
释义 读音
没有找到匹配的词条
换一个关键词，或清除当前筛选。
清除筛选
复制词条
已复制
词表分页
关闭
语言
暂无释义
未标注
未标注特殊读音
词表未标注特殊读音
词表加载失败
重新加载
"""


def lexicon_text_and_classes():
    """Text and font classes rendered by the client-side lexicon table.

    The table rows come from JSON at runtime, so they are absent from the
    static HTML that page_chars() normally scans. Return the full text for
    normal-weight faces and a smaller bold subset: only headings, labels,
    word forms and digits are rendered at weight 700, not the 621 meanings.
    """
    global _LEXICON_CACHE
    if _LEXICON_CACHE is not None:
        return _LEXICON_CACHE

    parts = ["0123456789", LEXICON_UI_TEXT]
    bold_parts = [
        "0123456789",
        LEXICON_UI_TEXT,
        "全部",
        "没有找到匹配的词条",
        "清除筛选",
        "复制词条",
        "已复制",
        "重新加载",
    ]
    classes = set()
    index_path = os.path.join(PUBLIC, "assets", "lexicon", "index.json")
    if not os.path.isfile(index_path):
        _LEXICON_CACHE = ("", set(), "")
        return _LEXICON_CACHE

    with open(index_path, encoding="utf-8") as handle:
        index = json.load(handle)

    for language in index.get("languages", []):
        for key in ("name", "native", "description"):
            value = language.get(key)
            if value:
                parts.append(str(value))
                if key in ("name", "native"):
                    bold_parts.append(str(value))
        for key in ("wordClass", "nativeClass"):
            value = language.get(key)
            if value:
                classes.add(str(value))

        data_path = os.path.join(PUBLIC, "assets", "lexicon", str(language.get("file", "")))
        if not os.path.isfile(data_path):
            continue
        with open(data_path, encoding="utf-8") as handle:
            data = json.load(handle)
        for field in data.get("fields", []):
            label = str(field.get("label", ""))
            parts.append(label)
            bold_parts.append(label)
        for entry in data.get("entries", []):
            for key in ("word", "phonetic", "pos", "meaning", "notes"):
                value = entry.get(key)
                if value:
                    parts.append(str(value))
                    if key in ("word", "pos"):
                        bold_parts.append(str(value))

    _LEXICON_CACHE = ("\n".join(parts), classes, "\n".join(bold_parts))
    return _LEXICON_CACHE


def subset_file(family, weight, style, source, unicodes):
    font = TTFont(io.BytesIO(source_bytes(source)))
    options = Options()
    options.flavor = "woff2"
    options.desubroutinize = True
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.hinting = False
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


def rules_for_family(family, unicodes, bold_unicodes=None):
    rules = []
    for weight, styles in FAMILIES[family].items():
        for style, source in styles.items():
            selected = bold_unicodes if (bold_unicodes is not None and weight >= 600) else unicodes
            keep = sorted(c for c in selected if c in source_cmap(source))
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
    families = set(page_families(text, lang))
    bold_chars = None

    # The lexicon rows are injected by JavaScript from assets/lexicon/*.json,
    # so include their glyphs and configured format classes here.
    if 'id="lexicon-app"' in text:
        lexicon_text, lexicon_classes, lexicon_bold_text = lexicon_text_and_classes()
        if lexicon_text:
            chars |= page_chars(lexicon_text)
        if lexicon_bold_text:
            bold_chars = page_chars(text) | page_chars(lexicon_bold_text)
        for css_class in lexicon_classes:
            family = CLASS_FAMILY.get(css_class)
            if family:
                families.add(family)
        # The lexicon UI is Chinese and has no #ja spans. SC already covers its
        # kana, so skip the large JP fallback subset on this page.
        if "ff-ja" not in text and "ff-ja_old" not in text:
            families.discard("Source Han Serif JP")

    rules = []
    for family in sorted(families):
        rules.extend(rules_for_family(family, chars, bold_chars))
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


def strip_full_font_faces():
    """Remove the local-preview @font-face rules that point at assets/fonts.

    The production output no longer contains those files, so leaving the rules
    in makes the browser request eight missing fonts per page and wait for each
    404 before it falls back to the next family.
    """
    pattern = re.compile(
        r"@font-face\{[^{}]*?url\(\s*[\"']?/assets/fonts/[^{}]*?\}",
        re.S,
    )
    total = 0
    for path in glob.glob(os.path.join(PUBLIC, "assets", "styles", "*.css")):
        with open(path, encoding="utf-8") as handle:
            css = handle.read()
        stripped, count = pattern.subn("", css)
        if count:
            with open(path, "w", encoding="utf-8") as handle:
                handle.write(stripped)
            total += count
    if total:
        print(f"[pagefonts] stripped {total} full-font @font-face rules")
    else:
        print("[pagefonts] no full-font @font-face rules to strip")


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

    # Drop the full local-preview fonts from the production output — the
    # per-page subsets above are what actually get served. `assets/fonts/`
    # stays in the source tree so `tola serve` still renders them locally.
    full_fonts = os.path.join(PUBLIC, "assets", "fonts")
    if os.path.isdir(full_fonts):
        shutil.rmtree(full_fonts)
        print("[pagefonts] removed full local-preview fonts from output")

    strip_full_font_faces()


if __name__ == "__main__":
    main()
