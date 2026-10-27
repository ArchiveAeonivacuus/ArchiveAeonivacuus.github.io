# Archive Aeonivacuus

> 漫步远乡 / ゑんきやうにありく

基于 **Tola + Typst** 的博客。正文用 Typst 编写（`content/**/*.typ`），构建期生成静态 HTML、RSS、Sitemap、Pagefind 全文索引，以及每页的 PDF。

## 技术栈

| 环节 | 方案 |
| --- | --- |
| 站点生成 | Tola 0.7.1 + Typst |
| 页面结构 | Typst 模板（`templates/`） |
| 样式 | 手写 CSS（OKLCH 设计令牌，无框架） |
| 客户端 | 原生 TypeScript（esbuild 打包） |
| 增量导航 | Swup |
| 全文搜索 | Pagefind |
| 图片灯箱 | PhotoSwipe |
| 评论 | Giscus |
| PDF | Typst CLI（用 `fonts-pdf/` 自托管字体） |

## 功能

- **内容**：Typst 原生语法；注音 `#ruby`（网页端 1-2-1 分布，PDF 端手工 1:2:1）、行内字体（`#ja` / `#old-ja` / `#ong` / `#latin` / `#lxgw` / `#kai` / `#old-cjk` 等）、诗词 / 歌词 / 符卡 / 和歌、对话、提示框、卡片、表格、脚注、Mermaid
- **多语言**：UI 跟随文章 `lang`（内置 12 种语言词表）；分类 / 标签按语言显示（含日语 ruby）；译文以 `translate_key` 关联，首页 / 归档只显示主版本
- **页面**：首页、文章、归档时间轴、关于、友链、404（内嵌 T-Rex dino 小游戏，TypeScript 重构自 Chromium offline runner）
- **归档筛选**：按标签 / 分类 / 未分类筛选
- **搜索**：Pagefind 全文索引，客户端防抖检索
- **目录**：客户端生成锚点与层级徽章，滚动高亮、自动跟随
- **主题**：亮色 / 暗色 / 跟随系统，可调主题色（hue），持久化到 localStorage
- **交互**：Swup 无刷新跳转、PhotoSwipe 灯箱、代码复制、返回顶部、移动端菜单
- **动效**：Banner 首页 / 内页切换与裁切、侧栏 sticky、初次进入错峰动画，遵循 `prefers-reduced-motion`
- **SEO**：RSS、Sitemap、Sitemap 索引、robots.txt、Open Graph / Twitter Card、favicon
- **PDF**：文章页提供下载按钮；PDF 与网页使用同一套字体和站点信息

## 目录结构

```
.
├── content/                # Typst 内容源
│   ├── index.typ           # 首页
│   ├── archive.typ         # 归档
│   ├── about.typ           # 关于
│   ├── friends.typ         # 友链
│   ├── 404.typ
│   └── posts/              # 文章（*.typ）
├── templates/
│   ├── fuwari.typ          # 入口（barrel，再导出以下模块）
│   ├── layout.typ          # 站点框架：导航、侧栏、Banner、页脚、TOC、SEO、PDF 排版
│   ├── post.typ            # 文章页、文章卡片、译文切换
│   ├── components.typ      # 内容组件：ruby / 行内字体 / 诗词 / 对话 / 提示框 / 表格 / 卡片 / 脚注等
│   ├── archive.typ         # 归档时间轴
│   ├── i18n.json           # UI 词表（12 种语言）
│   ├── words.json          # 分类 / 标签词条翻译（含日语 ruby）
│   ├── site-info.json      # 站点信息（脚本生成，供 PDF 与编辑器预览）
│   ├── stats.json          # 字数 / 阅读时长（脚本生成）
│   └── tola.typ            # Tola 基础模板（自动生成，勿改）
├── assets/
│   ├── styles/             # fuwari.css、fonts.css、photoswipe.css
│   ├── scripts/            # TypeScript 模块（入口 fuwari.ts）
│   ├── icons/              # 自托管 Iconify 图标数据（按图标集拆 JSON）
│   ├── webfonts/           # 网页字体（woff2 子集，自托管）
│   ├── images/             # 头像、Banner、文章图片
│   ├── favicon/
│   └── robots.txt
├── fonts-pdf/              # PDF 用完整字体（自托管，不参与网页部署）
├── scripts/
│   ├── build-stats.mjs          # 统计字数 / 阅读时长 → templates/stats.json
│   ├── build-site-info.mjs      # 导出站点信息 → templates/site-info.json
│   ├── build-icons.mjs          # 重新抓取自托管 Iconify 图标数据
│   ├── optimize-images.py       # 生成响应式 WebP 并改写页面
│   ├── build-pdf.mjs            # 逐页生成 PDF（--ignore-system-fonts + fonts-pdf）
│   ├── postprocess-sitemap.mjs  # sitemap 清理与索引
│   ├── gen-i18n.mjs / gen-words.mjs  # 生成语言词表 / 词条翻译
│   ├── migrate-archive-posts.mjs     # Archive Typst 文章迁入
│   └── vercel-setup.sh          # CI 下载 Tola / Typst 二进制
├── .vscode/                # Tinymist 配置（编辑器预览与 PDF 一致）
├── tola.toml               # 站点与构建配置
└── package.json
```

## 环境要求

- [Tola](https://github.com/tola-rs/tola-ssg) 0.7.1+
- [Typst](https://typst.app/) CLI 0.15+（生成 PDF 需要）
- Node.js 20+ 与 pnpm

## 开发

```bash
pnpm install
pnpm build:client   # 打包客户端脚本
pnpm build:site-info build:stats build:lexicon   # 生成站点信息、统计与词表 JSON
tola serve          # 本地预览 http://127.0.0.1:5277
```

## 构建

```bash
pnpm build
```

依次执行：

1. `build:client` — esbuild 打包 `assets/scripts/fuwari.ts` → `fuwari.js`
2. `build:dino` — esbuild 打包 404 的 T-Rex 游戏 → `dino.js`
3. `build:stats` — 统计字数 / 阅读时长 → `templates/stats.json`
4. `build:site-info` — 导出站点信息 → `templates/site-info.json`
5. `build:lexicon` — 把 `content/lexicon/*.csv` 转成 `assets/lexicon/*.json`
6. `build:site` — `tola build --clean`，随后自动运行逐页字体子集（含词表 JSON 中的全部词条）
7. `build:images` — 为封面 / 正文图片生成响应式 WebP，并改写页面 `srcset`
8. `build:404` — 复制 `404/index.html` → `404.html`
9. `build:sitemap` — 移除 404、补全 `lastmod`、生成 `sitemap-index.xml`
10. `build:search` — Pagefind 建立全文索引
11. `build:pdf` — 用 Typst 为每页生成 PDF（`--font-path fonts-pdf --ignore-system-fonts`，跳过草稿）

校验：

```bash
pnpm check   # tsc --noEmit + tola validate（链接与资源）
```

输出目录为 `public/`（已在 `.gitignore` 中忽略）。

## 写作

新建 `content/posts/<slug>.typ`：

```typst
#import "/templates/fuwari.typ": post

#show: post.with(
  title: "标题",
  date: "2026-10-05",
  summary: "摘要",
  tags: ("Tag",),
  category: "Journals",
  lang: "zh_CN",            // 可选：UI 随之切换
  translate_key: "slug",    // 可选：同组译文互联
)

正文……
```

- 字数与阅读时长由 `scripts/build-stats.mjs` 自动统计，无需手写；如需覆盖可显式传 `words` / `minutes`。
- `draft: true` 的文章不参与构建，也不生成 PDF。
- 代码块使用 Typst 原生围栏（自动语法高亮）。

内容组件在 `templates/components.typ`（可从 `/templates/fuwari.typ` 导入），例如：
`ruby`、`ja` / `old-ja` / `ong` / `latin` / `lxgw` / `kai` / `old-cjk`、`poem` / `lyrics` / `spell` / `waka`、`dialogue`、`aside`、`data-table`、`card`、`github`、`caption`、`cast-list`、`monster`、`divider`、`web-image`、`admonition`、`quote-block`、`github-card`、`link-card` 等。

新增或替换 `icon("...")` 后运行一次 `node scripts/build-icons.mjs`，把用到的图标写进 `assets/icons/`；构建本身不会访问 Iconify API。

### 怪物猎人图标

武器图标位于 `assets/images/mh-icons/weapons/<key>.png`，文件名使用官方英文 slug：

| key | 中文 | key | 中文 |
| --- | --- | --- | --- |
| `great-sword` | 大剑 | `long-sword` | 太刀 |
| `sword-and-shield` | 单手剑 | `dual-blades` | 双剑 / 双刀 |
| `hammer` | 大锤 | `hunting-horn` | 狩猎笛 |
| `lance` | 长枪 | `gunlance` | 铳枪 |
| `switch-axe` | 斩击斧 | `charge-blade` | 盾斧 / 充能斧 |
| `insect-glaive` | 操虫棍 | `light-bowgun` | 轻弩炮 |
| `heavy-bowgun` | 重弩炮 | `bow` | 弓 / 弓箭 |

在正文任意位置直接调用：

```typst
#mh-weapon("long-sword")
#mh-armor("head")
```

人物卡片推荐显式传入，避免中文标签歧义；需要多个图标时传数组：

```typst
#mh-card(
  (("武器类型", [大剑/太刀]),),
  weapon: ("great-sword", "long-sword"),
)
```

未传 `weapon:` 时，卡片会回退到 `templates/components.typ` 里的 `_weapon-icon` 中文映射；要改“名称 → 图标”的对应关系，编辑该字典即可。图标是普通 `<img>`，靠 PNG 自带的白色填充和黑色描边显示，不再使用 CSS mask。

### 造语词表

词表源码放在 `content/lexicon/`。每种语言一个 CSV，文件自己描述语言信息；`scripts/build-lexicon.mjs` 会自动扫描并生成 `assets/lexicon/*.json`，页面 `/lexicon/` 再读取这些 JSON 提供搜索与筛选。

`content/lexicon/ong.csv` 开头：

```csv
# name: 央额列语
# native: Onglısch
# format: ong
# description: 央额列王国的官方语言。
word,pos,phonetic,notes,meaning
abauton,prep.,,,关于
```

- `# key: value` 行是语言元数据，只出现在文件开头。
- 第一条非 `#` 行是**通用列标签**：`word,pos,phonetic,notes,meaning`。
- 数据行沿用这些列；引号、逗号规则与普通 CSV 相同。
- `phonetic` 放特殊读音；没有就留空，页面显示 `—`。

新增一种语言：复制一个 CSV 到 `content/lexicon/`，改 `# name`、`# native`、`# format`，然后运行：

```bash
pnpm build:lexicon
```

不需要 `languages.json`，也不需要手动维护 `index.json`。页面顶部的语言标签、统计、表头都会自动出现。`format` 使用正文行内字体组件的短名（如 `ong`、`old-cjk`、`zh-tw`），对应 `#ong`、`#old-cjk` 等格式；也可以直接写 `ff-*` 类名。单文件内还可用 `# wordclass:` / `# nativeclass:` 覆盖词条或语言名的格式，用 `# order:` 控制标签顺序。

`assets/lexicon/` 下的 JSON 是生成产物，不要手动编辑；`index.json` 也是自动生成的。

## 内容来源

文章来自 Archive Aeonivacuus 的 Typst 稿，可用 `scripts/migrate-archive-posts.mjs` 重新迁入（会重写元数据为 `post.with(...)` 并清理转换残留）。

## 编辑器预览

`.vscode/settings.json` 已配好 Tinymist：`rootPath`、`fontPaths=fonts-pdf`、`systemFonts=false`、`package-path=.tola/packages`，使**编辑器里的 PDF 预览与构建产物一致**。首次打开需先跑一次 `tola build`（生成 `.tola/packages`），并重载窗口。

## 部署

`public/` 为纯静态产物，可部署到任意静态托管。构建依赖 **Tola** 与 **Typst CLI**；托管平台若没有预装，可在构建阶段自动下载官方二进制（见 `scripts/vercel-setup.sh`，PDF 字体已随仓库自托管，无需下载）。

### GitHub Pages

仓库已包含 [.github/workflows/build.yml](.github/workflows/build.yml)：push 到 `main` 后会自动安装 Node、pnpm、Python，运行 `scripts/vercel-setup.sh`，再执行 `pnpm build`，最后把 `public/` 上传到 GitHub Pages。

- 首次使用时，在仓库 **Settings → Pages** 把 Source 设为 **GitHub Actions**。
- `pnpm build` 里的 `build:site` 已经包含逐页字体子集（包括词表 JSON 的全部词条），无需额外步骤。
- 如果 GitHub Pages 之前用分支部署，切换到 GitHub Actions 后再 push 一次。

### Vercel

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "bash scripts/vercel-setup.sh && PATH=$PWD/bin:$PATH pnpm run build",
  "outputDirectory": "public"
}
```

- Git 集成：导入本仓库，Framework Preset 选 **Other**（自动读取 `vercel.json`），直接 Deploy。
- CLI：`vercel link` 后 `vercel --prod`。
- 自定义域名：在 Vercel 绑定域名，并把 `tola.toml` 的 `site.info.url` 改为该域名（影响 sitemap / RSS / OG 的绝对地址），然后重新构建。

### 其他平台

- **GitHub Pages / Cloudflare Pages**：构建命令前安装 Tola 与 Typst，输出目录设为 `public`
- **无构建环境**：本地 `pnpm build` 后，把 `public/` 作为静态站点直接上传

## 致谢与许可

- 主题与交互设计参考 [Fuwari](https://github.com/saicaca/fuwari)（MIT License，Copyright © 2024 saicaca）
- 站点内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可
