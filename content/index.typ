#import "/templates/fuwari.typ": fuwari-base, post-card, empty-note, _posts
#import "@tola/site:0.0.0": info

#show: fuwari-base.with(
  title: info.title,
  summary: info.description,
)

#let posts = _posts()
#context {
  let cards = if posts.len() == 0 {
    empty-note("暂无文章")
  } else {
    for item in posts { post-card(item) }
  }

  if target() == "html" {
    html.elem("section", attrs: (class: "post-list", "aria-label": "文章列表"))[
      #cards
    ]
  } else {
    cards
  }
}
