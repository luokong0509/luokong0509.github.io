# BUSLOG · 汽车电子笔记

用 Hugo 生成的静态博客，托管在 GitHub Pages：<https://luokong0509.github.io/>

每篇文章是一个独立的 Markdown 文件，改哪篇就改哪个文件，不用碰 HTML。

## 目录结构

```
hugo.toml                 站点配置（站名、baseURL、代码高亮等）
data/categories.toml      分类定义（名称、代号、颜色、简介）
content/posts/*.md        文章正文，一篇一个文件 ← 日常只改这里
layouts/                  页面模板（首页 / 文章页 / 分类页）
static/css/main.css       全部样式
static/js/site.js         交互（报表面板、筛选、搜索、阅读进度）
static/images/wsl/*.png   文章里用到的截图
.github/workflows/hugo.yml  推送到 main 后自动构建并发布
```

## 写一篇新文章

在 `content/posts/` 下新建 `你的文章-slug.md`，开头写 front matter：

```markdown
+++
title = "CAN FD 帧格式：BRS 位到底在干什么"
date = 2026-12-01
categories = ["车载总线"]
minutes = 8
summary = "一句话摘要，会出现在首页列表里。"
draft = false
+++

正文从这里开始，用 Markdown 写。
```

- `title`：文章标题
- `date`：发布日期，首页按它倒序
- `categories`：必须是 `data/categories.toml` 里已有的分类名，例如 `车载总线`、`诊断与测试`、`AUTOSAR`、`功能安全`、`车载以太网`、`工具与脚本`
- `minutes`：预计阅读分钟数，纯展示用
- `summary`：首页列表里那句摘要
- `draft = true` 时不会发布

文件名（slug）决定网址：`content/posts/can-fd-brs.md` → `https://luokong0509.github.io/posts/can-fd-brs/`

## 支持的写法

标准 Markdown：`##` 标题、`-` / `1.` 列表、`>` 引用、`|` 表格、```` ``` ```` 代码块（带语言名会高亮）、`**粗体**`、`*斜体*`、`[链接](url)`、行内 `` `代码` ``。

图片用 Hugo 的 figure 短代码，图注会显示在图片下方：

```
{{</* figure src="/images/wsl/file-20261113105505211.png" alt="wsl --install 的安装过程" caption="wsl --install 的安装过程与创建默认用户提示" */>}}
```

把截图丢进 `static/images/wsl/`（或新建 `static/images/其他目录/`），`src` 写 `/images/wsl/文件名`。

注意：正文里的 `--` 不会被自动改成破折号（已在配置里关掉了排版转换），命令照原样写没问题。

## 新增一个分类

1. 编辑 `data/categories.toml`，末尾加一段：

```toml
[[items]]
id = "lin"
name = "LIN 总线"
code = "LIN"
color = "#7fb8d4"
desc = "一句话说明这个分类收什么。"
```

2. 文章里写 `categories = ["LIN 总线"]` 即可，首页筛选、分类总览都会自动带上它。

## 本地预览（可选）

装了 Hugo 的话，在仓库根目录执行：

```
hugo server -D
```

打开 <http://localhost:1313/> 看效果，改文件会自动刷新。没装 Hugo 也能直接改 md 推到 GitHub，Actions 会构建。

## 发布流程

推送到 `main` 分支后，`.github/workflows/hugo.yml` 自动构建 `public/` 并发布到 Pages，通常 1–2 分钟生效。构建失败会在仓库 Actions 页面看到日志。

Pages 的 Source 需要设为 **GitHub Actions**（Settings → Pages）。

## 旧文件

仓库根目录的 `WSL/` 是早期直接上传的 Obsidian 原文和截图，只作归档保留；线上使用的是 `content/posts/wsl-install-and-use.md` 和 `static/images/wsl/` 里的副本。
