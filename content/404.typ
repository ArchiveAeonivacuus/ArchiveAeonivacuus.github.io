#import "/templates/fuwari.typ": fuwari-base, page-card

#show: fuwari-base.with(
  title: "404",
  summary: "页面未找到",
)

#let silent-audio = "data:audio/wav;base64,UklGRiwAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQgAAACAgICAgICAgA=="

#page-card[
  #context {
    if target() == "html" {
      html.elem("div", attrs: (class: "notfound"))[
        #html.elem("img", attrs: (class: "notfound-image", src: "/assets/images/NotFound.png", alt: "页面未找到"))

        #html.elem("div", attrs: (id: "t", class: "offline dino"))[
          #html.elem("div", attrs: (id: "main-frame-error", class: "interstitial-wrapper"))[
            #html.elem("div", attrs: (id: "main-content"))[
              #html.elem("div", attrs: (class: "icon icon-offline"))
            ]
            #html.elem("div", attrs: (id: "offline-resources"))[
              #html.elem("img", attrs: (id: "offline-resources-1x", src: "/assets/dinorun/100-offline-sprite.png"))
              #html.elem("img", attrs: (id: "offline-resources-2x", src: "/assets/dinorun/200-offline-sprite.png"))
              #html.elem("template", attrs: (id: "audio-resources"))[
                #html.elem("audio", attrs: (id: "offline-sound-press", src: silent-audio))
                #html.elem("audio", attrs: (id: "offline-sound-hit", src: silent-audio))
                #html.elem("audio", attrs: (id: "offline-sound-reached", src: silent-audio))
              ]
            ]
          ]
        ]

        #html.elem("p", attrs: (class: "notfound-text"), "你访问的页面不存在，或者已经被移动。")
        #html.elem("div", attrs: (class: "notfound-links"))[
          #html.elem("a", attrs: (class: "notfound-link btn-regular", href: "/"), "返回首页")
          #html.elem("a", attrs: (class: "notfound-link btn-regular", href: "/archive/"), "查看归档")
        ]
      ]
      html.elem("script", attrs: (type: "module", src: "/assets/scripts/dino.js"))
    } else {
      heading(level: 1)[404]
      [你访问的页面不存在，或者已经被移动。]
      list(
        [#link("/")[返回首页]],
        [#link("/archive/")[查看归档]],
      )
    }
  }
]
