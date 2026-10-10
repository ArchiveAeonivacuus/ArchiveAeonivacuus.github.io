// Reusable content components for page sources.
// Usage: #import "/templates/components.typ": quote-block, ruby, ...

#let _admonition-title(kind) = if kind == "tip" { "提示" } else if kind == "important" { "重要" } else if kind == "warning" { "警告" } else if kind == "caution" { "注意" } else { "笔记" }

#let admonition(kind: "note", title: none, body) = context {
  if target() != "html" {
    body
  } else {
    html.elem("div", attrs: (class: "admonition admonition-" + kind))[
      #html.elem("div", attrs: (class: "admonition-title"), if title != none and title != "" { title } else { _admonition-title(kind) })
      #html.elem("div", attrs: (class: "admonition-body"), body)
    ]
  }
}

#let quote-block(body) = context {
  if target() != "html" { quote(body) } else { html.elem("blockquote", body) }
}

#let anchor(id) = context {
  if target() == "html" { html.elem("a", attrs: (id: id)) } else { [] }
}

#let content-image(src, alt: "") = context {
  if target() == "html" { html.elem("img", attrs: (src: src, alt: alt, loading: "lazy")) } else { image(src, width: 100%) }
}

// 1-2-1 ruby (W3C group-ruby): when the annotation is narrower than its base,
// the spacing at the start/end is half the spacing between annotation glyphs.
#let _ruby-annotation(reading, edge, inter) = text(size: 0.5em, {
  let chars = reading.clusters()
  h(edge)
  for (index, char) in chars.enumerate() {
    char
    if index < chars.len() - 1 { h(inter) }
  }
  h(edge)
})

#let ruby(base, reading) = context {
  if target() == "html" {
    html.elem("ruby", base + html.elem("rt", reading))
  } else {
    let annotation = if type(reading) == str and reading.clusters().len() > 0 {
      let count = reading.clusters().len()
      let extra = measure(base).width - measure(text(size: 0.5em, reading)).width
      if extra > 0pt {
        let edge = extra / (2 * count)
        _ruby-annotation(reading, edge, 2 * edge)
      } else {
        text(size: 0.5em, reading)
      }
    } else {
      text(size: 0.5em, reading)
    }
    box(stack(
      dir: ttb,
      spacing: 0.08em,
      align(center, move(dy: -0.12em, annotation)),
      align(center, base),
    ))
  }
}

#let hr-line() = context {
  if target() == "html" { html.elem("hr") } else { line(length: 100%, stroke: 0.5pt) }
}

#let empty-note(text) = context {
  if target() == "html" { html.elem("p", attrs: (class: "post-list-empty"), text) } else { text }
}

#let card-list(body) = context {
  if target() == "html" { html.elem("div", attrs: (class: "card-list"), body) } else { body }
}

#let github-card(repo) = context {
  let href = "https://github.com/" + repo
  let parts = repo.split("/")
  let owner = if parts.len() > 0 { parts.at(0) } else { repo }
  let name = if parts.len() > 1 { parts.at(1) } else { "" }
  if target() != "html" { link(href, repo) } else {
    html.elem("a", attrs: (class: "card-github", href: href, target: "_blank", rel: "noopener noreferrer", "data-repo": repo),
      html.elem("span", attrs: (class: "gc-titlebar"),
        html.elem("span", attrs: (class: "gc-titlebar-left"),
          html.elem("span", attrs: (class: "gc-owner"),
            html.elem("span", attrs: (class: "gc-avatar")) + html.elem("span", attrs: (class: "gc-user"), owner))
          + html.elem("span", attrs: (class: "gc-divider"), "/")
          + html.elem("span", attrs: (class: "gc-repo"), name))
        + html.elem("span", attrs: (class: "github-logo")))
      + html.elem("span", attrs: (class: "gc-description"), "Waiting for api.github.com...")
      + html.elem("span", attrs: (class: "gc-infobar"),
          html.elem("span", attrs: (class: "gc-stars"), "0")
          + html.elem("span", attrs: (class: "gc-forks"), "0")
          + html.elem("span", attrs: (class: "gc-license"), "no-license")
          + html.elem("span", attrs: (class: "gc-language"), "")))
  }
}

#let link-card(href, title, avatar: none, description: none) = context {
  if target() != "html" { link(href, title) } else {
    let avatar-node = if avatar != none and avatar != "" {
      html.elem("span", attrs: (class: "hc-avatar", style: "background-image:url('" + avatar + "');"))
    } else {
      html.elem("span", attrs: (class: "hc-avatar"))
    }
    html.elem("a", attrs: (class: "card-hyperlink", href: href, target: "_blank", rel: "noopener noreferrer"),
      html.elem("span", attrs: (class: "hc-titlebar"), avatar-node + html.elem("span", attrs: (class: "hc-title"), title))
      + html.elem("span", attrs: (class: "hc-description"), if description == none { "" } else { description }))
  }
}

// ---------------------------------------------------------------------------
// Archive timeline, grouped by year.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// ArchiveAeonivacuus content components (ported from the archive repo's
// `src/typst/blog-components.typ`). The `ruby` component is already defined
// above and is intentionally not duplicated. Names match the archive posts so
// their sources port over unchanged.
// ---------------------------------------------------------------------------

#let is-html() = target() == "html"

#let html-or(paged, make-html) = context {
  if is-html() { make-html() } else { paged }
}

#let span(class, body) = html-or(body, () => html.elem("span", attrs: (class: class), body))
#let class-span(class, body) = span(class, body)
#let raw-html(source) = html-or(none, () => html.elem("span", attrs: ("data-raw-html": source)))

// Inline bordered box (e.g. highlighting a name): HTML uses `.tx-box`,
// PDF/paged keeps the native `box(stroke: …)`.
#let boxed(body) = html-or(
  box(stroke: 0.5pt, inset: 1pt, body),
  () => html.elem("span", attrs: (class: "tx-box"), body),
)

#let divider() = html-or(line(length: 100%, stroke: 0.5pt + gray), () => html.elem("hr"))

// Archive posts reference images as `/images/...`; our assets live under
// `/assets/images/...`, so rewrite the prefix on the HTML target.
#let _rewrite-src(src) = if src.starts-with("/images/") { "/assets" + src } else { src }

#let web-image(src: "", alt: "") = context {
  if target() == "html" {
    html.elem("img", attrs: (class: "content-image", src: _rewrite-src(src), alt: alt, loading: "lazy"))
  } else {
    // The paged (PDF) target loads the image from disk, mapping the site's
    // `/images/...` URLs to the in-repo `/assets/images/...` files.
    let path = if src.starts-with("/images/") { "/assets" + src } else { src }
    if path == "" or path.starts-with("http") {
      []
    } else {
      block(width: 100%, align(center, image(path, alt: alt, width: 100%)))
    }
  }
}

#let caption(body) = html-or(align(center, body), () => html.elem("div", attrs: (class: "graph-title"), body))
#let cast-list(body) = html-or(body, () => html.elem("p", attrs: (class: "cast-list"), body))

#let data-table(columns: 4, ..cells) = html-or(
  table(columns: columns, ..cells.pos()),
  () => html.elem("div", attrs: (class: "typst-table-wrap"))[
    #table(columns: columns, ..cells.pos())
  ],
)

#let web-table(columns: 1, header: (), cells: ()) = html-or(
  table(columns: columns, ..header, ..cells),
  () => html.elem("div", attrs: (class: "typst-table-wrap"))[
    #html.elem("table", html.elem("tbody", table(columns: columns, ..cells)))
  ],
)

#let font-span(class, font, body) = context {
  if target() == "html" {
    html.elem("span", attrs: (class: class), body)
  } else {
    text(font: font, fallback: true, body)
  }
}

#let ja(body) = font-span("ff-ja", "Source Han Serif JP", body)
#let old-ja(body) = font-span("ff-ja_old", "Asebi Mincho", body)
#let ong(body) = font-span("ff-ong", "Old English Onglisch", body)
#let en(body) = font-span("ff-en", "Times New Roman", body)
#let rom(body) = font-span("ff-rom", ("High Tower Text", "Source Serif 4"), body)
#let zh(body) = font-span("ff-zh_cn", "Noto Serif SC", body)
#let old-cjk(body) = font-span("ff-cjk_old", ("Source Han Serif Old Style", "Noto Serif SC"), body)
#let dfkai(body) = font-span("ff-dfkai", "DFKai-SB", body)
#let kai(body) = font-span("ff-kai", "KaiTi", body)
#let mincho(body) = font-span("ff-min", "Source Han Serif JP", body)

#let monster(name, japanese: "", kind: none) = {
  let value = [#name]
  if japanese != "" { value += linebreak() + ja(japanese) }
  if kind == none { value } else { class-span("tx-" + kind, value) }
}

#let mermaid(source) = html-or(
  raw(block: true, source),
  () => html.elem("pre", attrs: (class: "mermaid"), source),
)

#let centered-box(class, body, font: none) = context {
  if target() == "html" {
    html.elem("div", attrs: (class: class), body)
  } else {
    block(width: 100%, align(center, if font == none { body } else { text(font: font, body) }))
  }
}

#let poem(lang: none, body) = centered-box(
  if lang == none { "poem" } else { "poem poem_" + lang },
  body,
  font: if lang == "ong" { ("Old English Onglisch", "Source Serif 4") } else { ("KaiTi", "Source Han Serif JP", "Noto Serif SC") },
)
#let lyrics(body) = context {
  if target() == "html" {
    html.elem("div", attrs: (class: "ci"), body)
  } else {
    block(width: 100%, inset: (x: 1.5em), text(font: ("KaiTi", "Source Han Serif JP", "Noto Serif SC"), body))
  }
}
#let spell(body) = centered-box("spellcard", body, font: ("KaiTi", "Source Han Serif JP", "Noto Serif SC"))
#let waka(body) = centered-box("waka", body, font: ("DFKai-SB", "KaiTi", "Source Han Serif JP", "Noto Serif SC"))

// Renders as the site's hyperlink card (avatar + title + description), which is
// what the archive site's client-side card fixup turned these into.
#let card(href: "#", title: "", avatar: "", body) = context {
  if target() == "html" {
    link-card(
      href,
      title,
      avatar: if avatar == "" { "/assets/favicon/favicon-light-32.png" } else { avatar },
      description: body,
    )
  } else {
    block(
      width: 100%,
      inset: 10pt,
      radius: 6pt,
      stroke: 0.5pt + luma(75%),
      [#link(href)[#strong(title)] #h(0.75em) #body],
    )
  }
}

#let github(repo: "") = card(href: "https://github.com/" + repo, title: repo)[]

#let dialogue(speaker: "???", body) = html-or(
  grid(columns: (6em, 1fr), gutter: 1.5em, align(right, strong(speaker)), body),
  () => html.elem("div", attrs: (class: "dialog-block"))[
    #html.elem("div", attrs: (class: "dialog-person"))[#speaker]
    #html.elem("div", attrs: (class: "dialog-content"))[#body]
  ],
)

// Maps the archive `aside` component onto our existing admonition styling.
#let aside(kind: "note", title: none, body) = admonition(kind: kind, title: title, body)

// Inline rotation (HTML uses CSS transform; PDF keeps native rotate).
#let rot-270(body) = context {
  if target() == "html" { html.elem("span", attrs: (class: "rotate-270"), body) } else { rotate(270deg, body) }
}

// Right-aligned block (HTML uses CSS text-align; PDF keeps native align).
#let align-right(body) = context {
  if target() == "html" { html.elem("span", attrs: (class: "align-right"), body) } else { align(right, body) }
}

// Monster Hunter character card (restored from old markdown `.mh-hunter`/`.mh-other`).
// `fields` is an array of (label, content) pairs; `equipment` is an array of (part, content) pairs.
#let mh-card(fields, equipment: (), combo: none, desc: none, cls: "mh-hunter") = context {
  if target() != "html" {
    block(inset: 10pt, radius: 6pt, stroke: 0.5pt + luma(60%))[
      #for f in fields { [#strong[f.at(0) + "："] #f.at(1) ] }
      #if equipment != () { [#strong[装备：] #for e in equipment { [#e.at(0)：#e.at(1) ] }] }
      #if combo != none { [#strong[连招：] #combo] }
      #if desc != none { [#strong[人物介绍：] #desc] }
    ]
  } else {
    html.elem("div", attrs: (class: cls))[
      #for f in fields { html.elem("div", attrs: ("data-label": f.at(0)), f.at(1)) }
      #if equipment != () {
        html.elem("div", attrs: (class: "mh-equipment", "data-label": "装备"))[
          #html.elem("div", attrs: (class: "armor-box"))[
            #for e in equipment { html.elem("div", attrs: ("data-part": e.at(0)), e.at(1)) }
          ]
        ]
      }
      #if combo != none { html.elem("div", attrs: (class: "mh-combo", "data-label": "连招"), combo) }
      #if desc != none { html.elem("div", attrs: (class: "mh-description", "data-label": "人物介绍"), desc) }
    ]
  }
}
