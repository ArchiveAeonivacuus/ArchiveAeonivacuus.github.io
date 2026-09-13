#!/usr/bin/env python3
"""
按「实际用到的字」生成 Web 字体子集。

相比旧的按 Unicode 区块分片（一页 80+ 请求、近 10MB），
这里每个字重只输出一个 woff2，全站缓存，通常一页只需 1~2 个请求。

用法：
    python3 scripts/font-subset.py            # 生成
    python3 scripts/font-subset.py --dry-run  # 只报告不写入

产物：
    public/fonts/web/<family>-<weight>-<style>.<hash>.woff2
    src/generated/fonts.ts   （@font-face CSS 字符串 + 预加载清单）

源字体放在 fonts-src/（不参与部署）。
"""

import hashlib
import io
import re
import shutil
import string
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools import subset

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "fonts-src"
OUT = ROOT / "public" / "fonts" / "web"
GEN = ROOT / "src" / "generated"

DRY_RUN = "--dry-run" in sys.argv

# ---------------------------------------------------------------- 字体清单
# weight/style 会写进 @font-face；local 用于让装了字体的读者跳过下载。
FONTS = [
    {
        "family": "Source Han Serif SC",
        "file": "SourceHanSerifSC-Regular.otf",
        "weight": "400",
        "style": "normal",
        "local": ["Source Han Serif SC", "Source Han Serif CJK SC"],
        "primary": True,
    },
    {
        "family": "Source Han Serif SC",
        "file": "NotoSerifCJK-Bold.ttc",
        "font_number": 2,  # SC face
        "weight": "700",
        "style": "normal",
        "chars": "bold",
        "local": ["Source Han Serif SC Bold", "Noto Serif CJK SC Bold"],
        "primary": True,
    },
    {
        "family": "Source Han Serif JP",
        "file": "SourceHanSerifJP-Regular.otf",
        "weight": "400",
        "style": "normal",
        "local": ["Source Han Serif JP", "Source Han Serif CJK JP"],
        "primary": True,
    },
    {
        "family": "Source Han Serif JP",
        "file": "NotoSerifCJK-Bold.ttc",
        "font_number": 0,  # JP face
        "weight": "700",
        "style": "normal",
        "chars": "bold",
        "local": ["Source Han Serif JP Bold", "Noto Serif CJK JP Bold"],
        "primary": True,
    },
    {
        "family": "Source Han Serif Old",
        "file": "SourceHanSerifOld-Light.otf",
        "weight": "400",
        "style": "normal",
        "local": ["Source Han Serif Old"],
    },
    {
        "family": "Asebi Mincho",
        "file": "AsebiMin-Light.ttf",
        "weight": "400",
        "style": "normal",
        "local": ["Asebi Mincho", "馬酔木明朝"],
    },
    {
        "family": "KaiTi",
        "file": "simkai.ttf",
        "weight": "400",
        "style": "normal",
        "local": ["KaiTi", "楷体", "Kaiti SC"],
    },
    {
        "family": "DFKai-SB",
        "file": "標楷體.ttf",
        "weight": "400",
        "style": "normal",
        "local": ["DFKai-SB"],
    },
    {
        "family": "Old English Onglisch",
        "file": "Old English Onglisch.otf",
        "weight": "400",
        "style": "normal",
        "local": ["Old English Onglisch"],
        "primary": True,
    },
    {
        "family": "HighTowerText",
        "file": "HTOWERT.TTF",
        "weight": "400",
        "style": "normal",
        "local": [],
    },
    {
        "family": "HighTowerText",
        "file": "HTOWERTI.TTF",
        "weight": "400",
        "style": "italic",
        "local": [],
    },
    {
        "family": "Source Serif 4",
        "file": "SourceSerif4-Regular.ttf",
        "weight": "400",
        "style": "normal",
        "local": ["Source Serif 4"],
        "primary": True,
    },
    {
        "family": "Source Serif 4",
        "file": "SourceSerif4-Bold.otf",
        "weight": "700",
        "style": "normal",
        "chars": "bold",
        "local": ["Source Serif 4 Bold"],
    },
    {
        "family": "Source Serif 4",
        "file": "SourceSerif4-Italic.ttf",
        "weight": "400",
        "style": "italic",
        "local": ["Source Serif 4 Italic"],
    },
]

# 语言 -> 预加载字体（页面的正文字体）
PRELOAD_BY_LANG = {
    "zh_CN": ["Source Han Serif SC"],
    "zh_TW": ["Source Han Serif SC"],
    "ja": ["Source Han Serif JP"],
    "en": ["Source Serif 4"],
    "A-ong": ["Old English Onglisch"],
    "A-zh_iang": ["Source Han Serif SC"],
}

# ---------------------------------------------------------------- 收集用字
def collect_chars() -> set[str]:
    chars: set[str] = set()
    bases = [
        ROOT / "src" / "content",
        ROOT / "src" / "i18n",
    ]
    files = [ROOT / "src" / "config.ts"]
    for base in bases:
        files += [p for p in base.rglob("*") if p.suffix in {".md", ".ts", ".astro", ".svelte"}]
    for path in files:
        try:
            chars |= set(path.read_text(encoding="utf-8"))
        except Exception:
            pass
    # 基础 ASCII + 常用标点，保证数字/日期/UI 文案覆盖
    chars |= set(string.ascii_letters + string.digits + string.punctuation + " \t\n")
    chars |= set("　，。、；：？！“”‘’（）《》〈〉【】〔〕—–…·・ー〜～％＋－×÷＝「」『』")
    return chars


def collect_bold_chars() -> set[str]:
    """粗体只用在标题/strong/加粗文案上，字形集合远小于正文。"""
    chars: set[str] = set()
    for path in (ROOT / "src" / "content").rglob("*.md"):
        text = path.read_text(encoding="utf-8")
        for line in text.splitlines():
            if re.match(r"^\s{0,3}#{1,6}\s", line):
                chars |= set(line)
            for m in re.finditer(r"\*\*(.+?)\*\*|__(.+?)__", line):
                chars |= set(m.group(0))
        title = re.search(r"^title:\s*(.+)$", text, re.M)
        if title:
            chars |= set(title.group(1))
    for path in (ROOT / "src" / "i18n").rglob("*.ts"):
        chars |= set(path.read_text(encoding="utf-8"))
    chars |= set(string.ascii_letters + string.digits + string.punctuation + " \t\n")
    chars |= set("　，。、；：？！“”‘’（）《》〈〉【】—…·・")
    return chars


def subset_font(
    path: Path, chars: set[str], out_path: Path, font_number: int = 0
) -> int:
    font = TTFont(str(path), fontNumber=font_number)
    options = subset.Options()
    options.flavor = "woff2"
    options.desubroutinize = True
    options.layout_features = ["*"]
    options.name_IDs = ["*"]
    options.no_hinting = True
    options.notdef_outline = True
    subsetter = subset.Subsetter(options=options)
    subsetter.populate(unicodes=[ord(c) for c in chars])
    subsetter.subset(font)
    font.flavor = "woff2"
    # 必须关掉：fonttools 保存时会重新计算复合字形（CJK 汉字）的包围盒，
    # 对 simkai / 標楷體 这类字体算错，导致汉字在字身框里左右错位、字距不均。
    font.recalcBBoxes = False
    buf = io.BytesIO()
    font.save(buf)
    font.close()
    payload = buf.getvalue()
    if not DRY_RUN:
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_bytes(payload)
    return len(payload)


def css_url_name(name: str) -> str:
    return f"/fonts/web/{name}"


def main() -> None:
    body_chars = collect_chars()
    bold_chars = collect_bold_chars()
    print(f"正文字形: {len(body_chars)}；粗体字形: {len(bold_chars)}")

    # 文件名带内容哈希，重跑会累积旧文件；先清空输出目录
    if not DRY_RUN:
        shutil.rmtree(OUT, ignore_errors=True)

    rules: list[str] = []
    preload: dict[str, str] = {}
    total = 0

    for font in FONTS:
        src = SRC / font["file"]
        if not src.exists():
            print(f"  跳过（缺少源文件）: {font['file']}")
            continue
        slug = (
            font["family"].replace(" ", "-").lower()
            + f"-{font['weight']}-{font['style']}"
        )
        chars = bold_chars if font.get("chars") == "bold" else body_chars
        tmp = OUT / f"{slug}.woff2"
        size = subset_font(src, chars, tmp, font.get("font_number", 0))
        # 用内容哈希做缓存失效
        digest = hashlib.sha1(tmp.read_bytes() if tmp.exists() else slug.encode()).hexdigest()[:8]
        final_name = f"{slug}.{digest}.woff2"
        final = OUT / final_name
        if not DRY_RUN:
            if tmp.exists():
                tmp.rename(final)
        total += size
        print(f"  {font['family']} {font['weight']} {font['style']}: {size/1024:.0f} KB -> {final_name}")

        srcs = [f"local({n!r})" for n in font.get("local", [])]
        srcs.append(f"url('{css_url_name(final_name)}') format('woff2')")
        rules.append(
            "@font-face {"
            f"font-family:'{font['family']}';"
            f"src:{','.join(srcs)};"
            f"font-weight:{font['weight']};"
            f"font-style:{font['style']};"
            "font-display:swap;"
            "}"
        )
        if font.get("primary"):
            preload.setdefault(font["family"], css_url_name(final_name))

    css = "\n".join(rules)
    preload_map = {
        lang: [preload[f] for f in fams if f in preload]
        for lang, fams in PRELOAD_BY_LANG.items()
    }

    if not DRY_RUN:
        GEN.mkdir(parents=True, exist_ok=True)
        ts = (
            "// AUTO-GENERATED by scripts/font-subset.py — do not edit by hand.\n"
            f"export const fontsCss = {css!r};\n"
            f"export const fontPreloadByLang: Record<string, string[]> = {preload_map!r};\n"
        )
        (GEN / "fonts.ts").write_text(ts, encoding="utf-8")
        print(f"\n生成 {GEN / 'fonts.ts'}，字体合计 {total/1024/1024:.1f} MB")
    else:
        print(f"\n(dry-run) 字体合计 {total/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
