// Post page and post card.
#import "/templates/layout.typ": fuwari-base, icon, _posts, _date, _tag-url, _category-url, stats-of, footnote-list, _translations, ui, word
#import "@tola/site:0.0.0": info
#import "@tola/current:0.0.0": current-permalink, prev, next

#let _post-meta(date: none, update: none, category: none, tags: (), hide-tags-mobile: false, lang: none) = {
  let t = ui(lang)
  let meta-item(icon-name, body) = html.elem("div", attrs: (class: "meta-item"), html.elem("span", attrs: (class: "meta-icon"), icon(icon-name)) + body)
  let tag-content = {
    if tags.len() == 0 {
      html.elem("span", t.noTags)
    } else {
      for (index, tag) in tags.enumerate() {
        if index > 0 { text(" / ") }
        html.elem("a", attrs: (href: "/archive", "data-href": _tag-url(tag)), word(str(tag), lang: lang))
      }
    }
  }
  html.elem("div", attrs: (class: "post-meta"))[
    #if date != none { meta-item("material-symbols:calendar-today-outline-rounded", html.elem("span", _date(date))) }
    #if update != none and _date(update) != _date(date) { meta-item("material-symbols:edit-calendar-outline-rounded", html.elem("span", _date(update))) }
    #meta-item("material-symbols:book-2-outline-rounded", html.elem("a", attrs: (href: "/archive", "data-href": _category-url(category)), if category == none or category == "" { t.uncategorized } else { word(str(category), lang: lang) }))
    #html.elem("div", attrs: (class: "meta-item" + if hide-tags-mobile { " meta-tags-optional" } else { "" }), html.elem("span", attrs: (class: "meta-icon"), icon("material-symbols:tag-rounded")) + html.elem("span", attrs: (class: "meta-tags"), tag-content))
  ]
}

#let post(title: none, summary: none, date: none, update: none, tags: (), category: none, image: none, draft: false, words: none, minutes: none, lang: none, translate_key: none, body) = {
  let stat = stats-of(current-permalink)
  let t = ui(lang)
  let words = if words != none { words } else { stat.at("w", default: none) }
  let minutes = if minutes != none { minutes } else { stat.at("m", default: none) }
  let all-posts = _posts()
  let previous = prev(all-posts)
  let following = next(all-posts)
  let translation-bar = context if target() == "html" {
    let items = _translations(translate_key)
    if items.len() > 1 {
      html.elem("div", attrs: (class: "post-translations", "aria-label": "文章语言"),
        html.elem("span", attrs: (class: "translations-label"), icon("material-symbols:translate") + html.elem("span", "语言"))
        + html.elem("span", attrs: (class: "translations-list"), {
          for item in items {
            let is-current = item.permalink == current-permalink
            html.elem("a", attrs: (
              href: item.permalink,
              class: "translation-link" + if is-current { " is-current" } else { "" },
              "data-lang": item.lang,
              "aria-current": if is-current { "true" } else { "false" },
            ), item.label)
          }
        })
      )
    } else { [] }
  } else { [] }
  let navigation = context if target() == "html" {
    html.elem("nav", attrs: (class: "post-navigation", "aria-label": "文章导航"))[
      #if following != none { html.elem("a", attrs: (href: following.permalink, class: "post-nav-link post-nav-prev card-base"), icon("material-symbols:chevron-left-rounded") + html.elem("span", following.title)) }
      #if previous != none { html.elem("a", attrs: (href: previous.permalink, class: "post-nav-link post-nav-next card-base"), html.elem("span", previous.title) + icon("material-symbols:chevron-right-rounded")) }
    ]
  } else { [] }
  let license = context if target() == "html" {
    html.elem("section", attrs: (class: "post-license"))[
      #html.elem("strong", title)
      #html.elem("a", attrs: (class: "license-url", href: if current-permalink == none { "/" } else { current-permalink }), if current-permalink == none { "/" } else { str(current-permalink) })
      #html.elem("div", attrs: (class: "license-details"))[
        #html.elem("span", html.elem("small", t.author) + html.elem("span", info.author))
        #html.elem("span", html.elem("small", t.publishedAt) + html.elem("span", _date(date)))
        #html.elem("span", html.elem("small", t.license) + html.elem("a", attrs: (href: "https://creativecommons.org/licenses/by-nc-sa/4.0/", target: "_blank", rel: "noopener"), "CC BY-NC-SA 4.0"))
      ]
    ]
  } else { [] }
  let pdf-url = if current-permalink == none { none } else {
    let p = str(current-permalink)
    (if p.ends-with("/") { p.slice(0, p.len() - 1) } else { p }) + ".pdf"
  }
  let article-body = context if target() == "html" {
    [
      #html.elem("article", attrs: (id: "post-container", class: "post-container card-base", "data-lang": if lang == none { "" } else { str(lang) }))[
        #if words != none or minutes != none { html.elem("div", attrs: (class: "post-stats onload-animation"))[#if words != none { html.elem("span", icon("material-symbols:notes-rounded") + str(words) + " " + (if words == 1 { t.wordCount } else { t.wordsCount })) } #if minutes != none { html.elem("span", icon("material-symbols:schedule-outline-rounded") + str(minutes) + " " + (if minutes == 1 { t.minuteCount } else { t.minutesCount })) }] }
        #html.elem("header", attrs: (class: "post-header onload-animation"))[
          #html.elem("h1", title)
          #_post-meta(date: date, update: update, category: category, tags: tags, lang: lang)
          #translation-bar
          #if summary != none and summary != "" { html.elem("p", attrs: (class: "post-summary"), summary) }
        ]
        #if pdf-url != none {
          html.elem("div", attrs: (class: "post-actions"))[
            #html.elem("a", attrs: (class: "post-pdf btn-regular", href: pdf-url, download: ""), icon("material-symbols:download-rounded") + html.elem("span", "下载 PDF"))
          ]
        }
        #if image != none and image != "" { html.elem("img", attrs: (id: "post-cover", class: "post-cover onload-animation", src: image, alt: "文章封面")) }
        #html.elem("div", attrs: (class: "markdown-content onload-animation", "data-pagefind-body": ""), body)
        #footnote-list()
        #license
      ]
      #html.elem("section", attrs: (id: "comments", class: "comments card-base", "aria-label": t.comments))
      #navigation
    ]
  } else { body }
  fuwari-base(article-body, title: title, summary: summary, date: date, update: update, tags: tags, category: category, image: image, draft: draft, words: words, minutes: minutes, lang: lang, translate_key: translate_key, article: true)
}

#let post-card(item) = {
  let href = item.at("permalink", default: "/")
  let title = item.at("title", default: "Untitled")
  let summary = item.at("summary", default: none)
  let date = item.at("date", default: none)
  let update = item.at("update", default: none)
  let tags = item.at("tags", default: ())
  let category = item.at("category", default: none)
  let image = item.at("image", default: none)
  let stat = stats-of(href)
  let words = item.at("words", default: stat.at("w", default: none))
  let minutes = item.at("minutes", default: stat.at("m", default: none))
  let t = ui(none)
  if target() == "html" {
    html.elem("article", attrs: (class: "post-card card-base onload-animation"))[
      #html.elem("div", attrs: (class: "post-card-body"))[
        #html.elem("h2", html.elem("a", attrs: (href: href, class: "post-card-link"), title))
        #_post-meta(date: date, update: update, category: category, tags: tags, hide-tags-mobile: true)
        #if summary != none and summary != "" { html.elem("p", attrs: (class: "post-card-summary"), summary) }
        #if words != none or minutes != none { html.elem("div", attrs: (class: "post-card-stats"), (if words != none { str(words) + " " + (if words == 1 { t.wordCount } else { t.wordsCount }) } else { "" }) + (if words != none and minutes != none { " | " } else { "" }) + (if minutes != none { str(minutes) + " " + (if minutes == 1 { t.minuteCount } else { t.minutesCount }) } else { "" })) }
      ]
      #if image != none and image != "" {
        html.elem("a", attrs: (href: href, class: "post-card-cover", "aria-label": title), html.elem("img", attrs: (src: image, alt: "", loading: "lazy")) + icon("material-symbols:chevron-right-rounded"))
      } else {
        html.elem("a", attrs: (href: href, class: "post-card-enter", "aria-label": title), icon("material-symbols:chevron-right-rounded"))
      }
    ]
  } else { block[#heading(level: 2)[#title] #if summary != none { summary }] }
}

// ---------------------------------------------------------------------------
// Simple content page (About / Friends): a card wrapping Markdown prose.
// ---------------------------------------------------------------------------
