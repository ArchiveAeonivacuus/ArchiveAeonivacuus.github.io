#import "/templates/fuwari.typ": fuwari-base, archive-panel, _posts

#let posts = _posts()

#show: fuwari-base.with(
  title: "Archive",
  summary: "文章归档",
)

#archive-panel(posts)
