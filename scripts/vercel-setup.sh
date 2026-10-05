#!/usr/bin/env bash
# Download the Tola and Typst CLI binaries needed by the build.
# Used by the Vercel build step (see vercel.json).
set -euo pipefail

BIN_DIR="${PWD}/bin"
TOLA_VERSION="v0.7.1"
TYPST_VERSION="v0.15.1"
ARCH="x86_64"

mkdir -p "$BIN_DIR"

download() {
  # download <url> <dest>
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL "$1" -o "$2"
  else
    wget -qO "$2" "$1"
  fi
}

extract_binary() {
  # extract_binary <archive> <binary-name> <dest>
  local archive="$1" name="$2" dest="$3" tmp
  tmp="$(mktemp -d)"
  case "$archive" in
    *.tar.gz|*.tgz) tar -xzf "$archive" -C "$tmp" ;;
    *.tar.xz)       tar -xJf "$archive" -C "$tmp" ;;
    *.zip)          unzip -q "$archive" -d "$tmp" ;;
  esac
  local found
  found="$(find "$tmp" -type f -name "$name" -print -quit)"
  if [ -z "$found" ]; then
    echo "could not find '$name' inside $archive" >&2
    exit 1
  fi
  mv "$found" "$dest"
  chmod +x "$dest"
  rm -rf "$tmp"
}

if [ ! -x "$BIN_DIR/tola" ]; then
  echo "==> installing tola ${TOLA_VERSION}"
  download "https://github.com/tola-rs/tola-ssg/releases/download/${TOLA_VERSION}/tola-${ARCH}-linux-static.tar.gz" /tmp/tola.tar.gz
  extract_binary /tmp/tola.tar.gz tola "$BIN_DIR/tola"
fi

if [ ! -x "$BIN_DIR/typst" ]; then
  echo "==> installing typst ${TYPST_VERSION}"
  download "https://github.com/typst/typst/releases/download/${TYPST_VERSION}/typst-${ARCH}-unknown-linux-musl.tar.xz" /tmp/typst.tar.xz
  extract_binary /tmp/typst.tar.xz typst "$BIN_DIR/typst"
fi

"$BIN_DIR/tola" --version
"$BIN_DIR/typst" --version

# PDF fonts are vendored in `fonts-pdf/` (committed, self-hosted), so nothing to
# download here. `build-pdf.mjs` points Typst at that directory.

# Per-page web fonts are generated with fontTools + brotli.
if ! python3 -c 'import fontTools, brotli' >/dev/null 2>&1; then
  echo "==> installing fonttools"
  python3 -m pip install --quiet --user fonttools brotli \
    || python3 -m pip install --quiet --break-system-packages fonttools brotli
fi
python3 -c 'import fontTools, brotli; print("fonttools ready")'
