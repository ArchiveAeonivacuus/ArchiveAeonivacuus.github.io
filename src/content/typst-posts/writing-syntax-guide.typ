#import "/src/typst/blog-components.typ": *

#metadata((
  title: "写作语法速查",
  published: "2026-09-13",
  updated: none,
  draft: true,
  description: "本站 Typst 文章格式、组件与常用命令速查（草稿，仅在开发模式可见）",
  image: "",
  tags: ("写作", "语法", "站务"),
  category: "站务",
  lang: "zh_CN",
  translate_key: "",
  rootClass: "",
)) <frontmatter>

= 写作语法速查

本站正文使用 Typst。`draft: true` 的文章只在开发模式显示，正式构建会排除。

== 一、注音

```typst
= 提灯于#ruby[赭][zhě]穹之下
#ruby[妮媧利亜][ニヴァーリア]
#ruby[百代魂縛死靈櫻][ひやくだいこんしばしりやうざくら]
```

效果：提灯于#ruby[赭][zhě]穹之下，#ruby[妮媧利亜][ニヴァーリア]。

#aside(kind: "note")[Ruby 的基字和注音都是 Typst 内容，可以嵌套字体组件。]

== 二、行内字体

#data-table(
  columns: 4,
  [指令], [字体], [指令], [字体],
  [`#ong[…]`], [Old English Onglisch], [`#ja[…]`], [Source Han Serif JP],
  [`#old-ja[…]`], [Asebi Mincho], [`#old-cjk[…]`], [Source Han Serif Old],
  [`#dfkai[…]`], [DFKai-SB], [`#ipa[…]`], [Times New Roman],
  [`#latin[…]`], [HighTowerText], [`#kai[…]`], [KaiTi],
  [`#mincho[…]`], [MS Mincho], [`#zh[…]`], [Source Han Serif SC],
)

示例：於留根洲（#ong[Orken]）、#ja[ニヴァーリア]、#ipa[/niʋaːlia/]。

字体和注音可以互相嵌套：

```typst
#ong[#ruby[赭][zhě]]
#ruby[赭][#ong[zhě]]
#ruby[#old-ja[糒]][かれいひ]
```

#aside(kind: "note")[网页端使用 CSS 字体类；PDF/Tinymist 使用本机字体并自动回退。]

== 三、诗词、和歌和符卡

```typst
#poem[
  雾霭飘自诃古棱，\
  暮色时分尽染红。
]

#lyrics[词的正文。]
#waka[和歌正文。]
#spell[符卡正文。]
#poem(lang: "ong")[Onglisch poem.]
```

#poem[
  雾霭飘自诃古棱，#linebreak()
  暮色时分尽染红。
]

== 四、对话

```typst
#dialogue(speaker: "璃")[
  你终于来了。

  #poem[
    雾霭飘自诃古棱。\
    暮色时分尽染红。
  ]
]
```

#dialogue(speaker: "璃")[
  你终于来了。

  #poem[
    雾霭飘自诃古棱。\
    暮色时分尽染红。
  ]
]

`speaker` 是人物名。正文可以包含段落、诗词、脚注和提示框。

== 五、提示框

```typst
#aside(kind: "note", title: "自定义标题")[
  提示内容。
]
```
#aside(kind: "note", title: "自定义标题")[
  提示内容。
]
`kind` 可使用 `note`、`tip`、`important`、`warning`、`caution`。省略 `title` 时使用类型名。

== 六、链接卡片

```typst
#card(
  href: "https://example.com",
  title: "标题",
  avatar: "https://example.com/favicon.ico",
)[描述]
```

- `href`：目标地址。
- `title`：标题。
- `avatar`：头像；网页使用远程 URL，PDF 只呈现标题和描述。
- 方括号中是描述，可以使用 Typst 行内组件。

#card(href: "https://typst.app", title: "Typst", avatar: "https://typst.app/favicon.ico")[Typst 官方网站]

GitHub 简写：

```typst
#github(repo: "ArchiveAeonivacuus/ArchiveAeonivacuus.github.io")
```

== 七、脚注、链接、图片与分隔线

```typst
#footnote[脚注内容。]
#link("https://typst.app")[Typst]
#web-image(src: "/images/example.png", alt: "替代文本")
#image("../../../public/images/NotFound.png")
#caption[图一　示例图]
#divider()
```

#footnote[脚注内容。]
#link("https://typst.app")[Typst]
#web-image(src: "/images/example.png", alt: "替代文本")
#image("../../../public/images/NotFound.png")
#caption[图一　示例图]
#divider()

脚注在网页中提供回跳，在 PDF 中使用原生脚注。以 `/images/` 开头的 Web URL 在 PDF 预览中会略去；可随 PDF 编译的图片应直接使用 `image()`。

== 八、表格

```typst
#data-table(
  columns: 3,
  [名称], [中文], [读音],
  [Aa], [字母 A], [/a/],
)
```

#data-table(
  columns: 3,
  [名称], [中文], [读音],
  [Aa], [字母 A], [/a/],
)

`#data-table` 同时支持网页和 PDF。网页端宽表格可横向滚动。不要在文章正文直接调用 `html.elem("table")`。

== 九、图题、演员表与 Mermaid

```typst
#caption[图一　示例图]
#cast-list[璃：采花妖；风见博之：阴阳武士。]
#mermaid("graph TD; A --> B")
```

#caption[图一　示例图]
#cast-list[璃：采花妖；风见博之：阴阳武士。]
#mermaid("graph TD; A --> B")

Mermaid 在 PDF 中以原始代码显示；复杂图建议导出成图片。

== 十、HTML/PDF 双目标

`blog-components.typ` 根据 `target()` 自动切换：

- Astro 构建：语义 HTML 与站点 CSS。
- Tinymist、PDF、PNG、SVG：原生 Typst 排版。
- 正文不要直接调用 `html.elem`，应使用公共组件。

每篇文件开头统一导入：

```typst
#import "/src/typst/blog-components.typ": *
```

== 十一、文章元数据

```typst
#metadata((
  title: "标题",
  published: "2026-10-05",
  updated: none,
  draft: false,
  description: "摘要；留空时自动取正文",
  image: "",
  tags: ("故事", "设定"),
  category: "瀛寰",
  lang: "zh_CN",
  translate_key: "",
  rootClass: "",
)) <frontmatter>
```

- 日期使用 `YYYY-MM-DD` 字符串。
- `description` 留空时首页自动提取摘要。
- `rootClass` 用于文章根节点附加样式类。

== 十二、多语言

同组译文使用相同的 `translate_key`，各文件填写正确的 `lang`。新建译文可复制现有 `.typ` 后修改 metadata：

```sh
cp src/content/typst-posts/base.typ src/content/typst-posts/base_ja.typ
```

== 十三、目录和命名

- 文章：`src/content/typst-posts/<slug>.typ`
- About/Friends：`src/content/spec-typst/*.typ`
- 公共组件：`src/typst/blog-components.typ`
- 文件名就是 URL slug，不使用 `.html.typ`。
- 同名 Markdown 存在时优先使用 Typst。

== 十四、常用命令

```sh
pnpm dev
pnpm build
pnpm astro check
pnpm lint
pnpm migrate:typst  # 会覆盖生成的迁移内容，谨慎使用

typst compile --root . src/content/typst-posts/example.typ example.pdf
```

== 十五、发布检查

- 将 `draft` 改为 `false`。
- 同时检查网页和 Tinymist/PDF。
- 检查摘要、字数、阅读时间、目录、脚注、上一篇/下一篇。
- 运行完整构建并确认 Pagefind 正常生成。
