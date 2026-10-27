#import "/templates/fuwari.typ": *

#show: fuwari-base.with(
  title: "Lexicon",
  summary: "造语词表查询：词形、读音、释义与注释",
)

#page-card[
  #html.elem("section", attrs: (class: "lexicon-intro"))[
    #html.elem("p", attrs: (class: "lexicon-kicker"), "CONLANG LEXICON · 造语档案")
    #html.elem("h1", attrs: (class: "lexicon-heading"), "造语词表")
    #html.elem("p", attrs: (class: "lexicon-lede"), "收录本站造语项目的词形、读音、释义与注释。切换语言查看不同词表；词条格式由各语言配置决定。")
  ]
  #html.elem("div", attrs: (id: "lexicon-app", class: "lexicon-app", "aria-busy": "true"))[
    #html.elem("div", attrs: (class: "lex-loading"), "正在载入词表…")
    #html.elem("noscript", "词表查询需要启用 JavaScript。")
  ]
]
