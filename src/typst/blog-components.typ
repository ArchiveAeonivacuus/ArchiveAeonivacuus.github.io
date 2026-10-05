#let is-html() = target() == "html"

#let html-or(paged, make-html) = context {
  if is-html() { make-html() } else { paged }
}

#let span(class, body) = html-or(body, () => html.elem("span", attrs: (class: class), body))
#let class-span(class, body) = span(class, body)

#let raw-html(source) = html-or(none, () => html.elem("span", attrs: ("data-raw-html": source)))
#let divider() = html-or(line(length: 100%, stroke: 0.5pt + gray), () => html.elem("hr"))
#let web-image(src: "", alt: "") = html-or(
  if src.starts-with("/") { [] } else { image(src, alt: alt) },
  () => html.elem("img", attrs: (src: src, alt: alt)),
)
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

#let font-span(class, font, body) = html-or(
  text(font: font, fallback: true, body),
  () => html.elem("span", attrs: (class: class), body),
)

#let ja(body) = font-span("ff-ja", "Source Han Serif JP", body)
#let old-ja(body) = font-span("ff-ja_old", "Asebi Mincho", body)
#let ong(body) = font-span("ff-ong", "Old English Onglisch", body)
#let ipa(body) = font-span("ff-en", "Times New Roman", body)
#let latin(body) = font-span("ff-rom", "HighTowerText", body)
#let zh(body) = font-span("ff-zh_cn", "Source Han Serif SC", body)
#let old-cjk(body) = font-span("ff-cjk_old", "Source Han Serif Old", body)
#let dfkai(body) = font-span("ff-dfkai", "DFKai-SB", body)
#let kai(body) = font-span("ff-kai", "KaiTi", body)
#let mincho(body) = font-span("ff-min", "MS Mincho", body)

#let ruby(base, reading) = html-or(
  box(stack(
    dir: ttb,
    spacing: 0.08em,
    align(center, move(dy: -0.12em, text(size: 0.5em, reading))),
    align(center, base),
  )),
  () => html.elem("ruby")[#base #html.elem("rt")[#reading]],
)

#let monster(name, japanese: "", kind: none) = {
  let value = [#name]
  if japanese != "" { value += linebreak() + ja(japanese) }
  if kind == none { value } else { class-span("tx-" + kind, value) }
}

#let mermaid(source) = html-or(raw(block: true, source), () => html.elem("pre", attrs: (class: "mermaid"), source))

#let centered-box(class, body) = html-or(
  block(width: 100%, align(center, body)),
  () => html.elem("div", attrs: (class: class), body),
)
#let poem(lang: none, body) = centered-box(if lang == none { "poem" } else { "poem poem_" + lang }, body)
#let lyrics(body) = html-or(block(width: 100%, inset: (x: 1.5em), body), () => html.elem("div", attrs: (class: "ci"), body))
#let spell(body) = centered-box("spellcard", body)
#let waka(body) = centered-box("waka", body)

#let card(href: "#", title: "", avatar: "", body) = html-or(
  block(
    width: 100%,
    inset: 10pt,
    radius: 6pt,
    stroke: 0.5pt + luma(75%),
    [#link(href)[#strong(title)] #h(0.75em) #body],
  ),
  () => html.elem("article", attrs: (class: "typst-link-card"))[
    #html.elem("img", attrs: (
      class: "typst-link-card-avatar",
      src: if avatar == "" { "/favicon/favicon-light-32.png" } else { avatar },
      alt: "",
    ))
    #html.elem("h3", attrs: (class: "typst-link-card-title"))[
      #html.elem("a", attrs: (href: href, target: "_blank", rel: "noopener"))[#title]
    ]
    #html.elem("p", attrs: (class: "typst-link-card-description"))[#body]
  ],
)

#let github(repo: "") = card(href: "https://github.com/" + repo, title: repo)[]

#let dialogue(speaker: "???", body) = html-or(
  grid(columns: (6em, 1fr), gutter: 1.5em, align(right, strong(speaker)), body),
  () => html.elem("div", attrs: (class: "dialog-block"))[
    #html.elem("div", attrs: (class: "dialog-person"))[#speaker]
    #html.elem("div", attrs: (class: "dialog-content"))[#body]
  ],
)

#let aside(kind: "note", title: none, body) = {
  let heading = if title == none { upper(kind) } else { title }
  html-or(
    block(
      width: 100%,
      inset: 10pt,
      radius: 4pt,
      stroke: (left: 2pt + rgb("4f9cf9")),
      [#strong(heading)#linebreak()#body],
    ),
    () => html.elem("blockquote", attrs: (class: "admonition bdm-" + kind))[
      #html.elem("span", attrs: (class: "bdm-title"))[#heading]
      #html.elem("div", attrs: (class: "bdm-content"))[#body]
    ],
  )
}
