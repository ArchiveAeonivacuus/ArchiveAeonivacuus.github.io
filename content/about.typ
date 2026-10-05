#import "/templates/fuwari.typ": *

#show: fuwari-base.with(
  title: "About",
  summary: "漫步远乡 / ゑんきやうにありく",
)

#page-card[
  #context { if target() == "html" { heading(level: 1)[About] } }

  Wandering in the Aeonivacuum, even the gravel will become steepest cliff, and last forever.

  #old-ja[幻の　#ruby[遠郷][ゑんきやう] 歩く　さざれ石　巌なりけるを　永久にゐる]

  #old-cjk[熙熙浮世裏 漫步遠鄉間 堅岩成砂石 鐫刻百億年]

  #card(
    href: "https://github.com/ArchiveAeonivacuus/ArchiveAeonivacuus.github.io",
    title: "ArchiveAeonivacuus.github.io",
    avatar: "https://github.com/favicon.ico",
  )[本站源代码]
]
