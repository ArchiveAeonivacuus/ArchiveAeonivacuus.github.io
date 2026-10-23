#import "/templates/fuwari.typ": *

#show: post.with(
  title: "写作语法速查",
  date: "2026-09-13",
  summary: "本站 Typst 文章格式、组件与常用命令速查（草稿，仅在开发模式可见）",
  tags: ("写作", "语法", "站务"),
  category: "站务",
  lang: "zh_CN",
  draft: true,
)

本站正文使用 Typst。`draft: true` 的文章只在开发模式显示，正式构建会排除。（当前疑似开发模式也不显示）

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
  [`#old-ja[…]`], [Asebi Mincho], [`#kr[…]`], [Source Han Serif KR],
  [`#old-cjk[…]`], [Source Han Serif C], [`#zh-tw[…]`], [Source Han Serif TC],
  [`#lxgw[…]`], [LXGW WenKai], [`#en[…]`], [Times New Roman],
  [`#rom[…]`], [HighTowerText], [`#kai[…]`], [KaiTi],
  [`#mincho[…]`], [MS Mincho], [`#zh[…]`], [Source Han Serif SC],
  [`#ar[…]`], [Amiri], [], [],
)

示例：於留根洲（#ong[Orken]）、#ja[ニヴァーリア]、#en[/niʋaːlia/]。

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

=== 汉文训读（漢文訓読）

```typst
#kanbun(
  "孤之有ルハ[二]孔明[一]，猶ホ‹ごと›«キ»[二]魚之有ルガ[一レ]水也。",
  font: "jp",
)
```

#kanbun(
  "孤之有ルハ[二]孔明[一]，猶ホ‹ごと›«キ»[二]魚之有ルガ[一レ]水也。",
  font: "jp",
)

汉文训读在网页端由 kanbunHTML（AGPL-3.0，见 `assets/scripts/kanbun.LICENSE`）渲染，PDF/打印端由 `hundouk` 渲染，两端共用一套标注语法：

- `(読み)`：汉字读音（振り仮名），如 `濺(そそ)`。
- `{送り仮名}`：送假名（可省略，直接写在汉字后也行）。
- `[二]`、`[一]`、`[レ]`、`[上]`、`[下]` 等：返り点。
- `‹読み›` / `«送り仮名»`：再読文字的振假名/送假名。
- `―`：たて点（连字符）。
- `font: "jp"`（默认，思源宋体日标）/ `"c"`（思源宋体古典标）/ `"asebi"`（Asebi Mincho，同 `#old-ja`）。
- `tight: false`（默认疏排 アキ組）/ `true`（密排 ベタ組）。
- `horizontal: false`（默认纵排）/ `true`（横排）。
- `inline: false`（默认独占一段、放大字号）/ `true`（与正文同字号、内联不换行，需配合 `horizontal: true`）。

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
#web-image(src: "/assets/images/archive-NotFound.png", alt: "")
#caption[图一　示例图]
#divider()
```

#footnote[脚注内容。]
#link("https://typst.app")[Typst]
#web-image(src: "/images/example.png", alt: "替代文本")
#web-image(src: "/assets/images/archive-NotFound.png", alt: "")
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

== 十、怪物猎人卡片与图标

人物卡使用 `mh-card`：

```typst
#mh-card(
  (
    ("出身地", [仁汨村]),
    ("种族", [人类]),
    ("武器类型", [太刀]),
    ("武器", [飞龙刀【朱】]),
  ),
  equipment: (
    ("头甲", [火龙S头盔]),
    ("胸甲", [火龙S铠甲], [收磨珠1]),
  ),
  combo: [纵斩连段#linebreak()气刃三连斩连段],
  desc: [小说主角。],
  weapon: "long-sword",
)
```

- `fields`：`(标签, 内容[, 装饰])` 数组。
- `equipment`：`(部位, 名称[, 装饰])` 数组；部位可用 `头甲`、`胸甲`、`腕甲`、`腰甲`、`腿甲`。
- `combo` / `desc`：网页卡片中的连招与人物介绍。
- `weapon`：显式指定武器图标；一个角色使用多种武器时传数组，例如 `weapon: ("great-sword", "long-sword")`。省略时会按 `武器类型` 的文本查 `_weapon-icon` 字典兜底。
- `cls`：非猎人卡片可传 `"mh-other"`。

武器、防具图标也可以脱离卡片单独调用，放在正文任意位置：

```typst
#mh-weapon("long-sword")
#mh-armor("head")
```

武器 key 使用官方英文 slug：

| key | 中文 | key | 中文 |
| --- | --- | --- | --- |
| `great-sword` | 大剑 | `long-sword` | 太刀 |
| `sword-and-shield` | 单手剑 | `dual-blades` | 双剑 / 双刀 |
| `hammer` | 大锤 | `hunting-horn` | 狩猎笛 |
| `lance` | 长枪 | `gunlance` | 铳枪 |
| `switch-axe` | 斩击斧 | `charge-blade` | 盾斧 / 充能斧 |
| `insect-glaive` | 操虫棍 | `light-bowgun` | 轻弩炮 |
| `heavy-bowgun` | 重弩炮 | `bow` | 弓 / 弓箭 |

图标文件分别在 `assets/images/mh-icons/weapons/<key>.png` 和 `assets/images/mh-icons/armor/<key>.png`。新增图标时按 key 命名放入对应目录即可，不需要再改 CSS。

要修改“武器类型文本 → 默认图标”的对应关系，编辑 `templates/components.typ` 中的 `_weapon-icon` 字典：

```typst
#let _weapon-icon = (
  "大剑": "great-sword",
  "太刀": "long-sword",
  "单手剑": "sword-and-shield",
  // ……
)
```

图标是普通 `<img>`，会保留原图的白色填充与黑色描边，不再通过 CSS mask 着色。

== 十一、HTML/PDF 双目标

`blog-components.typ` 根据 `target()` 自动切换：

- Astro 构建：语义 HTML 与站点 CSS。
- Tinymist、PDF、PNG、SVG：原生 Typst 排版。
- 正文不要直接调用 `html.elem`，应使用公共组件。

每篇文件开头统一导入：

```typst

```

== 十二、文章元数据

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

== 十三、多语言

同组译文使用相同的 `translate_key`，各文件填写正确的 `lang`。新建译文可复制现有 `.typ` 后修改 metadata：

```sh
cp src/content/typst-posts/base.typ src/content/typst-posts/base_ja.typ
```

== 十四、目录和命名

- 文章：`src/content/typst-posts/<slug>.typ`
- About/Friends：`src/content/spec-typst/*.typ`
- 公共组件：`src/typst/blog-components.typ`
- 文件名就是 URL slug，不使用 `.html.typ`。
- 同名 Markdown 存在时优先使用 Typst。

== 十五、常用命令

```sh
pnpm dev
pnpm build
pnpm astro check
pnpm lint
pnpm migrate:typst  # 会覆盖生成的迁移内容，谨慎使用

typst compile --root . src/content/typst-posts/example.typ example.pdf
```

== 十六、发布检查

- 将 `draft` 改为 `false`。
- 同时检查网页和 Tinymist/PDF。
- 检查摘要、字数、阅读时间、目录、脚注、上一篇/下一篇。
- 运行完整构建并确认 Pagefind 正常生成。

