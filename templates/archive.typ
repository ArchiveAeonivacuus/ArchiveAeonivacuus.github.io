// Archive timeline.
#import "/templates/layout.typ": icon, ui

#let _short-date(value) = {
  let s = str(value)
  if s.len() >= 10 { s.slice(5, 10) } else { s }
}

#let _year-of(value) = {
  let s = str(value)
  if s.len() >= 4 { s.slice(0, 4) } else { s }
}

#let _tag-string(tags) = {
  let parts = ()
  for tag in tags { parts.push("#" + str(tag)) }
  parts.join(" ")
}

#let archive-panel(posts) = context {
  if target() != "html" {
    return for item in posts {
      link(item.permalink, item.at("title", default: "Untitled"))
      linebreak()
    }
  }
  let years = ()
  let t = ui(none)
  let buckets = (:)
  for item in posts {
    let year = _year-of(item.at("date", default: ""))
    if year not in years { years.push(year) }
    buckets.insert(year, buckets.at(year, default: ()) + (item,))
  }
  let groups = {
    for year in years {
      let items = buckets.at(year)
      html.elem("section", attrs: (class: "archive-group"))[
        #html.elem("div", attrs: (class: "archive-year-row"), html.elem("span", attrs: (class: "archive-year"), year) + html.elem("span", attrs: (class: "archive-dot")) + html.elem("span", attrs: (class: "archive-count"), str(items.len()) + " " + (if items.len() == 1 { t.postCount } else { t.postsCount })))
        #html.elem("div", attrs: (class: "archive-items"))[
          #for item in items {
            let tags = item.at("tags", default: ())
            let tag-list = if type(tags) == array { tags } else { () }
            let category = item.at("category", default: none)
            let data-tags = tag-list.fold("", (acc, t) => acc + (if acc == "" { "" } else { " " }) + str(t))
            let data-category = if category == none { "" } else { str(category) }
            let attrs = (
              class: "archive-item",
              href: str(item.at("permalink", default: "/")),
              "aria-label": str(item.at("title", default: "Untitled")),
              "data-tags": data-tags,
              "data-category": data-category,
            )
            html.elem("a", attrs: attrs,
              html.elem("span", attrs: (class: "archive-date"), _short-date(item.at("date", default: "")))
              + html.elem("span", attrs: (class: "archive-line"), html.elem("span", attrs: (class: "archive-item-dot")))
              + html.elem("span", attrs: (class: "archive-title"), item.at("title", default: "Untitled"))
              + html.elem("span", attrs: (class: "archive-tags"), _tag-string(tags))
            )
          }
        ]
      ]
    }
  }
  html.elem("div", attrs: (class: "archive-page card-base onload-animation"), if posts.len() == 0 { html.elem("p", attrs: (class: "post-list-empty"), "暂无文章") } else { groups })
}
