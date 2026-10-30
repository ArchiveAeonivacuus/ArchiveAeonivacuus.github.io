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

== 十一、造语词表维护

站点词表页是 `/lexicon/`。每种语言使用一个 `.lex` 文件，文件开头描述语言和列样式，之后每行一个词条。构建脚本会自动扫描 `content/lexicon/`，自动生成 `assets/lexicon/index.json` 和各语言 JSON，不需要单独的清单或手动索引。

=== 文件

| 文件 | 用途 |
| --- | --- |
| `content/lexicon/ong.lex` | 央额列语词条 + 语言元数据 |
| `scripts/build-lexicon.mjs` | 扫描 `.lex` / `.csv`，生成 `assets/lexicon/*.json` |
| `scripts/convert-lexicon-csv.mjs` | 把旧 CSV 转成 `.lex` |
| `assets/lexicon/*.json` | 自动生成，不要手改 |
| `assets/scripts/lexicon.ts` | 搜索、筛选、分页、弹窗、样式渲染 |
| `assets/styles/lexicon.css` | 词表页样式、读音样式 |

=== .lex 格式

```text
# name: 央额列语
# native: Onglısch
# format: ong
#column word ong
#column phonetic en

word | phonetic | pos | meaning | notes
abauton |  | prep. | 关于 | 
@rom | Arcanum | /arˈkaːnum/ | n. | 秘仪 | 注释里有 #ong[Onglısch] 这个词
```

- 文件开头的 `# 键: 值` 是语言元数据。
- `#column 字段 样式` 给整列指定样式。
- 行首 `@样式` 给整行指定样式。
- 单元格里的 `#样式[...]` 只给局部文字指定样式。
- 优先级：`#样式[...]` > 行 `@...` > 列 `#column` > 语言默认 `format`。
- `|` 分隔单元格；单元格内写字面竖线时用 `\|`。
- 空单元格直接留空，不需要引号。
- 用 UTF-8 保存；带不带 BOM 均可。

支持的元数据：

| 键 | 作用 |
| --- | --- |
| `name` | 页面上的语言显示名 |
| `native` | 语言自称 |
| `format` | 词条和自称的默认字体格式 |
| `description` | 语言标签下方的说明 |
| `order` | 多语言时的排序号，可选 |
| `wordclass` | 只覆盖词条格式，可选 |
| `nativeclass` | 只覆盖语言名格式，可选 |

没有写 `name` 时使用文件名；没有写 `native` 时使用 `name`。

=== 修改词条

1. 编辑 `content/lexicon/ong.lex`；
2. 运行：

```bash
pnpm build:lexicon
```

3. 本地预览 `tola serve`，正式构建 `pnpm build`。

`assets/lexicon/` 下的 JSON 和 `index.json` 都是生成产物，文件名带内容哈希；不要手动编辑，也不要手动改 `public/`。

=== 从 CSV 迁移

旧 CSV 仍能读取。需要转换时运行：

```bash
pnpm convert:lexicon
```

默认把 `content/lexicon/ong.csv` 转成 `content/lexicon/ong.lex`。转换器会把备注里的 `<ong>...</ong>` 转成 `#ong[...]`，不会直接修改 CSV；目标文件已存在时需加 `-- --force` 才覆盖。

=== 新增或删除语言

新增：复制一个 `.lex` 文件到 `content/lexicon/`，修改开头的 `# name`、`# native`、`# format` 等元数据，运行 `pnpm build:lexicon`。页面语言标签会自动出现。

删除：直接删除对应 `.lex` 文件，再运行 `pnpm build:lexicon`。`assets/lexicon/` 会被整体重建。

=== 词条样式

`format`、`#column`、`@行` 和 `#样式[...]` 都使用正文行内字体组件的短名：

| 名称 | 对应正文 |
| --- | --- |
| `ong` | `#ong` |
| `old-cjk` | `#old-cjk` |
| `zh-tw` | `#zh-tw` |
| `ja` | `#ja` |
| `old-ja` | `#old-ja` |
| `lxgw` | `#lxgw` |
| `kai` | `#kai` |

也可以直接写 `ff-*` 类名。短名到 CSS 类的映射在 `scripts/lex-format.mjs` 的 `STYLE_CLASSES`。

=== 读取与样式

- 表格读音：`assets/styles/lexicon.css` 的 `.lex-phonetic-cell`。
- 详情弹窗读音：同文件的 `.lex-dialog-phon`。
- 当前两处都没有斜体；改字体、字号、颜色直接改这两个选择器。
- 搜索字段是通用的五列；特殊字符折叠规则在 `assets/scripts/lexicon.ts` 的 `SPECIAL_FOLDS`。
- 字体子集会从 `.lex` 生成的数据中收集行/列/局部样式对应的字体。

=== 注意

- 只改词条或加同结构语言：只改 `.lex`。
- 新增超过现有五列的新字段（如例句、词源分类）：需要同时改 `lex-format.mjs`、`build-lexicon.mjs` 和 `lexicon.ts`。
- `phonetic` 目前只收特殊读音；要让所有词都显示 IPA，需要在 `.lex` 里补齐该列。

== 十二、HTML/PDF 双目标

`blog-components.typ` 根据 `target()` 自动切换：

- Astro 构建：语义 HTML 与站点 CSS。
- Tinymist、PDF、PNG、SVG：原生 Typst 排版。
- 正文不要直接调用 `html.elem`，应使用公共组件。

每篇文件开头统一导入：

```typst

```

== 十三、文章元数据

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

== 十四、多语言

同组译文使用相同的 `translate_key`，各文件填写正确的 `lang`。新建译文可复制现有 `.typ` 后修改 metadata：

```sh
cp src/content/typst-posts/base.typ src/content/typst-posts/base_ja.typ
```

== 十五、目录和命名

- 文章：`src/content/typst-posts/<slug>.typ`
- About/Friends：`src/content/spec-typst/*.typ`
- 公共组件：`src/typst/blog-components.typ`
- 文件名就是 URL slug，不使用 `.html.typ`。
- 同名 Markdown 存在时优先使用 Typst。

== 十六、常用命令

```sh
pnpm dev
pnpm build
pnpm astro check
pnpm lint
pnpm migrate:typst  # 会覆盖生成的迁移内容，谨慎使用

typst compile --root . src/content/typst-posts/example.typ example.pdf
```

== 十七、发布检查

- 将 `draft` 改为 `false`。
- 同时检查网页和 Tinymist/PDF。
- 检查摘要、字数、阅读时间、目录、脚注、上一篇/下一篇。
- 运行完整构建并确认 Pagefind 正常生成。

