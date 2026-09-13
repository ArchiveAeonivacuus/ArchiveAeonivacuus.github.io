---
title: 写作语法速查
published: 2026-09-13
description: 本站自定义 Markdown 写作语法速查（草稿，仅在开发模式可见）
image: ''
tags: [写作, 语法, 站务]
category: '站务'
draft: true
lang: 'zh_CN'
translate_key: ''
---

# 写作语法速查

这篇草稿记录本站自定义的 Markdown 扩展语法。`draft: true` 表示它只在 `pnpm dev` 时可见，正式构建会被排除。

## 一、注音（ruby）

用 `{基字|注音}`。基字可以是单字，也可以是多字词组；注音支持拼音、假名、任何文本。

```markdown
# 提灯于{赭|zhě}穹之下
{妮媧利亜|ニヴァーリア}  ·  {妿|gē}迷罗  ·  {百代魂縛死靈櫻|ひやくだいこんしばしりやうざくら}
```

效果：提灯于{赭|zhě}穹之下，{妮媧利亜|ニヴァーリア}，{妿|gē}迷罗。

相邻的多个注音可以连写：{皤|pó}{鄢|yān}。

> 注音里不能出现 `{`、`}`、`|` 或换行；代码块内不会被解析。

## 二、行内字体

用 `:指令[文本]` 切换字体：

| 指令 | 字体 | 指令 | 字体 |
|:--|:--|:--|:--|
| `:ong[…]` | Old English Onglisch | `:ja[…]` | Source Han Serif JP |
| `:ja_old[…]` | Asebi Mincho | `:cjk_old[…]` | Source Han Serif Old |
| `:dfkai[…]` | DFKai-SB | `:en[…]` | Times New Roman |
| `:rom[…]` | HighTowerText | `:kai[…]` | KaiTi |
| `:min[…]` | MS Mincho | `:zh_cn[…]` | Source Han Serif SC |

> Asebi Mincho / KaiTi / DFKai-SB / Old English Onglisch / HighTowerText 都只有单一字重，
> 页面已关闭字体合成（`font-synthesis: none`），所以它们不会出现伪粗体。真正需要粗体的是正文思源宋体，已提供真粗体。

示例：於留根洲（:ong[Orken]）、:jp[ニヴァーリア] 的读音是 :ipa[/niʋaːlia/]。

### 字体 + 注音一起用

注音解析能识别内部的行内元素，因此**两种顺序都支持**：

```markdown
:ong[{赭|zhě}]         → 整个「赭（zhě）」用央语字体
{赭|:ong[zhě]}         → 只给注音 zhě 用央语字体，基字保持默认
{:ja_old[糒]|かれいひ}   → 只给基字「糒」用 Asebi，注音保持默认
:en[{皤|pó}{鄢|yān}]   → 相邻两个注音同属一种字体
```

实测效果：:ong[{赭|zhě}]、{赭|:ong[zhě]}、{:asebi[糒]|かれいひ}、:ipa[{皤|pó}{鄢|yān}]。

> 注音里不能出现换行或另一个 `{`；代码块内不解析。
> 在原始 HTML 区块（`<table>`、`<div>`、独占一行的 `<span>`、`<!-- -->`）内仍需手写 `<ruby>` / `<span class="ff-…">`。

## 三、诗 / 词盒子

用容器指令，等价于原来的 `<div class="…">`：

```markdown
:::shi
雾霭飘自诃古棱，<br>
暮色时分尽染红。
:::
```

可用：`:::shi`（诗，居中；中日文页面自动用楷体）、`:::ci`（词，楷体，每段首行缩进两格）、`:::spellcard`、`:::poet`（央语字体居中）、`:::waka`。

> 容器内部一律按 Markdown 解析，所以 `{字|音}` / `:字体[]` 在盒子里也能用（旧的 `<div class="shi">` 紧跟正文时是 HTML 区块，Markdown 不解析，简写会失效）。
>
> 两个注意点：① 每个 `:::shi` 必须有对应的 `:::` 收尾；② 正文行不要以 `:::` 开头，否则会被当成闭合围栏。`scripts/migrate-boxes.mjs` 已把旧写法批量迁移过来。

:::shi

雾霭飘自诃古棱，<br>
暮色时分尽染红。

:::

## 四、链接卡片

单行叶子指令 `::card{…}`，只有 `href` 必填：

```markdown
::card{href="https://example.com" title="标题" avatar="头像URL" desc="描述"}
```

- `title` 省略时用域名；`avatar` 省略时用 `<域名>/favicon.ico`；`desc` 省略时为空。
- `desc` 是**纯文本**，不要塞 HTML（旧写法把带引号的 HTML 放进属性会把指令解析弄坏）。
- 旧的 `::hyperlink{…}` / `:::hyperlink{…}` 仍兼容，但建议统一用 `::card`。

::card{href="https://www.bilibili.com/" title="哔哩哔哩" desc="自动使用站点 favicon 作头像"}

## 五、原始 HTML 区块的例外

`{…}` 和 `:指令[…]` 只在**普通 Markdown** 中解析。若内容处在原始 HTML 区块里（`<table>`、`<div>`、独占一行的 `<span>`、`<!-- 注释 -->`），Markdown 不会解析，请直接用 HTML：

```html
<table>
  <tr><td><span class="ff-ja"><ruby>迩岱空部<rt>ニタイカㇻペ</rt></ruby>の森</span></td></tr>
</table>
```

`ff-*` 类名与上表指令一一对应：`:ong` ↔ `ff-ong`、`:ja` ↔ `ff-ja`、`:ja_old` ↔ `ff-ja_old`，以此类推。

## 六、多语言

同一篇文章的各语言版本共享同一个 `translate_key`，页面顶部会自动出现语言切换条。新建翻译：

```sh
pnpm new-translation <base-slug> <lang> --title="译文标题"
```

## 七、常用命令

```sh
pnpm new-post <filename> [--lang=ja] [--translate-key=key] [--category=…] [--tags=a,b] [--title="…"]
pnpm new-translation <base-slug> <lang> [--title="…"]
pnpm migrate            # 把旧的 <ruby> / 内联字体样式迁移成新语法
pnpm migrate --dry-run  # 只报告不写入
pnpm dev / build / check / lint
```

写完记得把 `draft` 改成 `false` 再发布。
