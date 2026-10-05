#import "blog-components.typ": *

= Astro + Typst 原型

这是由真正的 Typst 编译为语义 HTML 的测试页面，而不是仿 Typst 的 Markdown 扩展。

== 行内排版与注音

日文：#ja[ニヴァーリア]；古日文：#old-ja[竹取物語]；央语：#ong[Linselotte Guenther]；音标：#ipa[/niʋaːlia/]；拉丁字体：#latin[Lanterarium]。

注音：#ruby[赭][zhě]、#ruby[#old-ja[竹取物語]][たけとりものがたり]。

== 诗歌

#poem[
  雾霭飘自诃古棱，\
  暮色时分尽染红。
]

#poem(lang: "ong")[
  #ong[An Dın Uncértus Márınen.]
]

== 对话与嵌套

#dialogue(speaker: "璃")[
  你终于来了。

  #aside(kind: "note", title: "嵌套提示")[
    这是对白内部的提示框。
  ]

  #poem[
    #old-ja[春はあけぼの。]\
    #old-ja[やうやう白くなりゆく山ぎは。]
  ]
]

== 普通 Typst 内容

- 无序列表
- *强调*与 _着重_
- #link("https://typst.app")[Typst 官方网站]

$ integral_0^1 x^2 dif x = 1/3 $

#footnote[这是由 Typst 生成的脚注。]
