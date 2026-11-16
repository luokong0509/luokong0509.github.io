# BUSLOG · 汽车电子笔记

一个跑在 GitHub Pages 上的静态博客：深色仪表盘风格，含**首页**与**分类**两个功能，文章用 Markdown 写在同一个 `index.html` 里，不需要 Node、不需要构建、不需要 GitHub Actions。

## 目录

```
auto-electronics-blog/
├── index.html      # 站点全部内容：样式 + 脚本 + 文章
├── .nojekyll       # 让 GitHub Pages 跳过 Jekyll 处理
└── README.md       # 本文件
```

一个文件就是整个站。改完 `index.html` 提交，Pages 一分钟内自动更新。

## 一、部署到 GitHub Pages

### 方式 A：网页点几下（5 步）

1. GitHub 右上角 **+ → New repository**，仓库名建议 `blog`，可见性选 **Public**（私有仓库用 Pages 需要付费方案）。
2. 进入仓库 → **Add file → Upload files**，把 `index.html` 和 `.nojekyll` 拖进去，Commit。
3. 仓库 → **Settings → Pages** → Source 选 **Deploy from a branch** → Branch 选 **main**、目录选 **/(root)** → Save。
4. 等 1～2 分钟，页面顶部会出现站点地址。
5. 访问 `https://<你的用户名>.github.io/<仓库名>/`。

### 方式 B：让我直接推送

我把文件通过 GitHub API 推到你的仓库并开启 Pages，你只需要确认一次。适合不想手动上传的情况。

### 仓库名和网址的关系

| 仓库名 | 站点地址 |
| --- | --- |
| `blog` | `https://luokong0509.github.io/blog/` |
| `luokong0509.github.io` | `https://luokong0509.github.io/`（根域名，最简洁） |
| `auto-electronics-blog` | `https://luokong0509.github.io/auto-electronics-blog/` |

换仓库名只影响网址，不影响代码。

## 二、更新文章（最常做的事）

打开 `index.html`，找到 `<!-- ===== POSTS ===== -->` 之后的一段段 `<script type="text/markdown" data-post ...>`，复制任意一段替换内容即可：

```html
<script type="text/markdown" data-post
        data-slug="can-fd-frame"
        data-title="CAN FD 的一次帧结构变化"
        data-date="2026-11-20"
        data-category="bus"
        data-minutes="7"
        data-summary="一句话摘要，会显示在列表里。">
## 二级标题
正文用 Markdown 写，代码块用三个反引号包住。
</script>
```

字段说明：

- `data-slug`：唯一英文短名，文章地址就是 `#/post/<slug>`，发布后不要改；
- `data-date`：`YYYY-MM-DD`，列表按它倒序排；
- `data-category`：下面六个 id 之一 —— `bus` `diag` `autosar` `safety` `eth` `tools`；
- `data-minutes`：阅读时长，列表里显示"X 分钟"；
- `data-summary`：列表页的一句话摘要。

支持的 Markdown 语法：`##/###/####` 标题、段落、`-` 与 `1.` 列表、``` 代码块、`>` 引用、`|` 表格、`---` 分隔线、行内 `` ` ``、`**粗体**`、`*斜体*`、`[链接](url)`。

### 新增分类

在 `index.html` 里搜 `var CATEGORIES = [`，照着已有格式加一条：

```js
{ id: "hil", code: "HIL", name: "测试台架", color: "#7fb2a5", desc: "HIL、残余总线仿真与自动化测试序列。" },
```

`id` 同时要写进文章的 `data-category`。

## 三、改站名和配色

| 想改什么 | 在哪 |
| --- | --- |
| 站点名 BUSLOG / 汽车电子笔记 | 顶部 `.brand-txt`、页脚 `footer`、`<title>`、首页 H1 |
| 主色（青）与点缀色（琥珀、砖红） | `:root` 里的 `--cyan`、`--amber`、`--rust` |
| 背景与面板色 | `--bg`、`--panel`、`--line` |
| 品牌图标 | `<head>` 里的 `rel="icon"` data URI 和顶部 SVG |
| 首页开场文案 | 首页 `<h1>把一个字节解成车速</h1>` 与 `.lede` |

## 四、本地预览

在这个目录下执行：

```
python -m http.server 8000
```

然后访问 `http://localhost:8000`。不用起服务的话，直接双击 `index.html` 也能打开，只是右上角时钟等无害。

## 五、已知边界

- 没有评论、没有 RSS、没有分页。文章在几十篇以内，搜索和筛选都在浏览器内存里做，速度不受影响。
- 首页的"CAN 报文流"面板是界面演示用的示例数据，不是真实抓包。
- 站点是全静态的，没有后台，因此也不会被拖库或者挂掉。
