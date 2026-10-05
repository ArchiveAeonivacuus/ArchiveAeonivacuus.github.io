# SakiMidare's Blog

基于 **Tola + Typst** 重建的个人博客，从 [Fuwari](https://github.com/saicaca/fuwari)（Astro 主题）迁移而来。内容用 Typst 编写，构建期生成静态 HTML、RSS、Sitemap、Pagefind 索引以及每页的 PDF。

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
| PDF | Typst CLI |

## 功能

- **内容**：Typst 编写，支持代码高亮与行号、Admonition、GitHub 卡片、链接卡片、表格、数学公式、删除线
- **页面**：首页、文章、归档时间轴、关于、友链、404（内嵌 T-Rex dino 小游戏，TypeScript 重构自 Chromium offline runner）
- **归档筛选**：按标签 / 分类 / 未分类筛选
- **搜索**：Pagefind 全文索引，客户端防抖检索
- **目录**：客户端生成锚点与层级徽章，滚动高亮、自动跟随
- **主题**：亮色 / 暗色 / 跟随系统，可调主题色（hue），持久化到 localStorage
- **交互**：Swup 无刷新跳转、PhotoSwipe 灯箱、代码复制、返回顶部、移动端菜单
- **动效**：Banner 首页/内页切换与裁切、侧栏 sticky、初次进入错峰动画，遵循 `prefers-reduced-motion`
- **SEO**：RSS、Sitemap、Sitemap 索引、robots.txt、Open Graph / Twitter Card、favicon
- **PDF**：每页构建期生成，文章页提供下载按钮

## 目录结构

```
.
├── content/                # Typst 内容源
│   ├── index.typ           # 首页
│   ├── archive.typ         # 归档
│   ├── about.typ           # 关于
│   ├── friends.typ         # 友链
│   ├── 404.typ
│   └── posts/              # 文章
├── templates/
│   ├── fuwari.typ          # 入口（barrel，再导出以下模块）
│   ├── layout.typ          # 站点框架：导航、侧栏、Banner、页脚、TOC、SEO、PDF 排版
│   ├── post.typ            # 文章页与文章卡片
│   ├── components.typ      # 内容组件：quote-block、ruby、admonition、github/link 卡片等
│   ├── archive.typ         # 归档时间轴
│   └── tola.typ            # Tola 基础模板（自动生成，勿改）
├── assets/
│   ├── styles/             # fuwari.css、photoswipe.css
│   ├── scripts/            # TypeScript 模块（入口 fuwari.ts）
│   ├── images/             # 头像、Banner
│   ├── favicon/
│   ├── posts/              # 文章图片
│   └── robots.txt
├── scripts/
│   ├── migrate-posts.mjs       # Markdown → Typst 转换器
│   ├── build-pdf.mjs           # 逐页生成 PDF
│   └── postprocess-sitemap.mjs # sitemap 清理与索引
├── utils/tola.typ          # Tola 工具函数（自动生成，勿改）
├── tola.toml               # 站点与构建配置
└── package.json
```

## 环境要求

- [Tola](https://github.com/tola-rs/tola-ssg) 0.7.1+
- [Typst](https://typst.app/) CLI（生成 PDF 需要）
- Node.js 20+ 与 pnpm

## 开发

```bash
pnpm install
pnpm build:client   # 打包客户端脚本
tola serve          # 本地预览 http://127.0.0.1:5277
```

## 构建

```bash
pnpm build
```

依次执行：

1. `build:client` — esbuild 打包 `assets/scripts/fuwari.ts` → `fuwari.js`
2. `build:dino` — esbuild 打包 404 的 T-Rex 游戏 → `dino.js`
3. `build:site` — `tola build --clean` 生成 HTML、RSS、Sitemap
4. `build:404` — 复制 `404/index.html` → `404.html`
5. `build:sitemap` — 移除 404、补全 `lastmod`、生成 `sitemap-index.xml`
6. `build:search` — Pagefind 建立全文索引
7. `build:pdf` — 用 Typst 为每页生成 PDF（若存在 `assets/fonts/` 则以其作为字体路径）

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
)

正文……
```

字数与阅读时长由构建期脚本自动统计（`scripts/build-stats.mjs` → `templates/stats.json`），无需在元数据里手写；如需覆盖可显式传 `words` / `minutes`。

代码块使用 Typst 原生围栏（自动语法高亮）：

````markdown
```c
int main(void) { return 0; }
```
````

其他可用组件（在 `/templates/components.typ`，也可继续从 `/templates/fuwari.typ` 导入）：`admonition`、`quote-block`、`ruby`、`github-card`、`link-card`、`content-image`、`hr-line`、`empty-note`、`card-list`、`anchor`。

## 从 Fuwari 迁移

原 Astro 文章通过 `scripts/migrate-posts.mjs` 自动转换为 Typst：

```bash
node scripts/migrate-posts.mjs
```

覆盖标题、段落、强调、删除线、链接、图片、列表、引用、表格、代码块（原生围栏）、数学公式、Admonition、GitHub / 链接卡片、站内锚点，并复制文章本地图片。

## 部署

`public/` 为纯静态产物，可部署到任意静态托管。

构建依赖 **Tola** 与 **Typst CLI**。托管平台若没有预装，可在构建阶段自动下载官方二进制（见 `scripts/vercel-setup.sh`）。

部署前请确认 `tola.toml` 中的 `site.info.url` 已设置为线上地址。

### Vercel

**`scripts/vercel-setup.sh`** 会把 Tola、Typst 以及 PDF 所需的中文字体（思源宋体 Noto Serif SC、JetBrains Mono）下载到 `./bin` 与 `assets/fonts`。

```json
{
  "installCommand": "pnpm install",
  "buildCommand": "bash scripts/vercel-setup.sh && PATH=$PWD/bin:$PATH pnpm run build",
  "outputDirectory": "public"
}
```

**方式一：Git 集成（推荐）**

1. 打开 <https://vercel.com/new>，导入 `sakimidare/tola-blog`
2. Framework Preset 选 **Other**（Vercel 会自动读取 `vercel.json`）
3. 直接 Deploy；之后每次 push 到 `main` 会自动构建

**方式二：CLI**

```bash
pnpm add -g vercel
vercel login
vercel link          # 关联项目
vercel --prod        # 生产部署
```

**自定义域名**：在 Vercel 项目的 Settings → Domains 绑定域名，并把 `tola.toml` 的 `site.info.url` 改为该域名（影响 sitemap / RSS / OG 的绝对地址）。

### 其他平台

- **GitHub Pages / Cloudflare Pages**：同样在构建命令前安装 Tola 与 Typst，输出目录设为 `public`
- **无构建环境**：本地 `pnpm build` 后，将 `public/` 作为静态站点直接上传

## 致谢与许可

- 主题与交互设计参考 [Fuwari](https://github.com/saicaca/fuwari)（MIT License，Copyright © 2024 saicaca）
- 站点内容采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 许可
