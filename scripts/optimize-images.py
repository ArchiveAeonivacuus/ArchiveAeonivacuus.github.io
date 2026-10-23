#!/usr/bin/env python3
"""Generate responsive WebP derivatives for the images the pages actually use.

Runs after `tola build`, before the per-page font subsets. The originals stay
in `public/assets/images/` and are kept as the full-resolution source for the
lightbox; the page itself points at the WebP variants via `srcset`.

Only local images referenced by a post card, an article cover or a content
image are processed. Banner/avatar/icon images are left untouched.
"""

import glob
import hashlib
import os
import re
from urllib.parse import unquote

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = os.path.join(ROOT, "public")
OUT = os.path.join(PUBLIC, "assets", "images", "optimized")

# role -> (candidate widths, sizes attribute)
ROLES = {
    "card": ((800,), "(max-width: 40rem) 100vw, 300px"),
    "content": ((800, 1600), "(max-width: 48rem) 100vw, 760px"),
    "cover": ((800, 1600), "(max-width: 48rem) 100vw, 760px"),
}

QUALITY = 84
MIN_BYTES = 60 * 1024
MIN_WIDTH = 480

IMG_RE = re.compile(r"<img\b[^>]*>", re.I)
CARD_RE = re.compile(
    r'(<a\b[^>]*\bclass="[^"]*post-card-cover[^"]*"[^>]*>)(\s*)(<img\b[^>]*>)',
    re.I | re.S,
)
ATTR_RE = re.compile(r'([:\w-]+)="([^"]*)"')


def parse_attrs(tag):
    attrs = ATTR_RE.findall(tag)
    # Keep the order stable, but make lookup convenient.
    return attrs, {key: value for key, value in attrs}


def rebuild_img(attrs, overrides):
    seen = set()
    parts = []
    for key, value in attrs:
        seen.add(key)
        if key in overrides:
            parts.append(f'{key}="{overrides[key]}"')
        elif key in {"srcset", "sizes"}:
            continue
        else:
            parts.append(f'{key}="{value}"')
    for key, value in overrides.items():
        if key not in seen:
            parts.append(f'{key}="{value}"')
    return "<img " + " ".join(parts) + " />"


def local_path(src):
    if not src.startswith("/"):
        return None
    path = os.path.join(PUBLIC, unquote(src.lstrip("/")))
    return path if os.path.isfile(path) else None


def variant(source, width):
    digest = hashlib.sha1()
    with open(source, "rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    digest.update(f"{width}:{QUALITY}".encode())
    short = digest.hexdigest()[:10]
    stem = re.sub(r"[^a-zA-Z0-9._-]+", "-", os.path.splitext(os.path.basename(source))[0]).strip("-")
    name = f"{stem}-{width}-{short}.webp"
    out = os.path.join(OUT, name)
    if os.path.exists(out):
        return name

    with Image.open(source) as image:
        frame = image.copy()
    if frame.width > width:
        height = max(1, round(frame.height * width / frame.width))
        frame = frame.resize((width, height), Image.LANCZOS)
    if frame.mode in ("P", "PA"):
        frame = frame.convert("RGBA" if "transparency" in frame.info else "RGB")
    elif frame.mode not in ("RGB", "RGBA"):
        frame = frame.convert("RGBA" if "A" in frame.mode else "RGB")
    frame.save(out, "WEBP", quality=QUALITY, method=6)
    return name


def processed(tag, role):
    attrs, values = parse_attrs(tag)
    src = values.get("src", "")
    if src.startswith("/assets/images/optimized/") or values.get("data-full-src"):
        return tag
    source = local_path(src)
    if not source:
        return tag

    size = os.path.getsize(source)
    if size < MIN_BYTES:
        return tag

    with Image.open(source) as image:
        width, height = image.size
    if width < MIN_WIDTH:
        return tag

    wanted, sizes = ROLES[role]
    if width > max(wanted):
        widths = list(wanted)
    else:
        widths = sorted({w for w in wanted if w < width} | {width})
    widths = [w for w in widths if w >= MIN_WIDTH] or [width]

    names = [(w, variant(source, w)) for w in widths]
    largest = names[-1]
    overrides = {
        "src": f"/assets/images/optimized/{largest[1]}",
        "srcset": ", ".join(f"/assets/images/optimized/{name} {w}w" for w, name in names),
        "sizes": sizes,
        "width": str(width),
        "height": str(height),
        "decoding": "async",
    }
    if role != "card":
        overrides.update(
            {
                "data-full-src": src,
                "data-full-width": str(width),
                "data-full-height": str(height),
            }
        )
    if role == "card":
        overrides["fetchpriority"] = "low"
    return rebuild_img(attrs, overrides)


def role_of(tag):
    attrs, values = parse_attrs(tag)
    classes = set(values.get("class", "").split())
    if values.get("id") == "post-cover":
        return "cover"
    if "content-image" in classes:
        return "content"
    return None


def process_page(path):
    with open(path, encoding="utf-8") as handle:
        text = handle.read()
    original = text

    def card(match):
        return match.group(1) + match.group(2) + processed(match.group(3), "card")

    def image(match):
        role = role_of(match.group(0))
        return processed(match.group(0), role) if role else match.group(0)

    text = CARD_RE.sub(card, text)
    text = IMG_RE.sub(image, text)

    if text != original:
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(text)
        return 1
    return 0


def main():
    pages = glob.glob(os.path.join(PUBLIC, "**", "*.html"), recursive=True)
    if not pages:
        print("[images] no pages; run a Tola build first")
        return

    os.makedirs(OUT, exist_ok=True)

    changed = sum(process_page(path) for path in pages)
    files = glob.glob(os.path.join(OUT, "*.webp"))
    total = sum(os.path.getsize(path) for path in files)
    print(f"[images] {changed} pages rewritten, {len(files)} WebP files, {total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
