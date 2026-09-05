## Context

见 proposal.md 的动机。问答输入、用量分段、顶栏主题开关都已存在，业务 store 与快捷键不用改。根因是 Element Plus 仍用默认主色 `#409EFF`，且这三处几乎没按平台 token 换皮。主规格目录尚未归档，行为以 `add-rag-workspace` 的能力规格为对照。

## Goals / Non-Goals

**Goals:**

- 用项目 CSS 变量驱动 Element Plus 主色，避免每个控件各写一套蓝。
- 问答动作槽位与 GPT 一致：同一圆钮位置，发送 / 停止互斥。
- 用量分段、主题入口与卡片圆角、侧栏主色同一套语言。

**Non-Goals:**

- 不改 chat / usage / theme 的数据流、接口或持久化键。
- 不引入第二套组件库，不把分段或圆钮做成脱离 Element Plus 的新组件包。
- 不重做整站主题体系（只接主色，不重映射全部 EP 语义色）。

## Decisions

### 1. 在 `theme.scss` 映射 `--el-color-primary`

- **选择**：`:root` 与 `html.dark` 都设置 `--el-color-primary: var(--color-primary)`。
- **原因**：发送圆钮、分段选中、后续 EP 控件会一起对齐，不必在三个页面重复写颜色。
- **备选**：只在各页 scoped 覆盖。能做，但还会和默认 EP 开关 / 按钮继续打架。

### 2. 问答动作用同一个 `el-button` 槽位

- **选择**：空闲渲染圆形主色按钮 + `Top`（或同等上箭头）图标；`streaming` 时改渲染圆形按钮，中心用一小块方块表示停止。点击分别走现有 `submit` / `chatStore.stop`。
- **原因**：规格要求互斥；EP 没有「圆里方块」现成图标，中心方块用按钮内容里的一小块样式即可，仍是 `el-button`。
- **备选**：保留「发送」文字按钮。与停止圆钮不成对，也是用户要去掉的旧皮。

### 3. 输入区加高，不改自动增高逻辑的上限

- **选择**：textarea 默认约两行（`min-height` 约 `3em`），外层 composer 内边距加大；保留现有 `max-height: 192px`。
- **原因**：用户要的是「拉高一点」，不是 ChatGPT 那种占半屏的草稿箱。
- **备选**：加 JS 自动增高。现有 `resize: none` + max-height 已够用，本轮不加行为。

### 4. 用量继续用 `el-segmented`，只换皮

- **选择**：保留 `el-segmented`，用页面 class 做成圆角分段条（容器边框、选中圆角滑块）。
- **原因**：设计原文就允许该控件；换 `el-radio-group` 没有新能力。
- **备选**：自定义 radio。违反「EP 能用就不要重造」。

### 5. 顶栏主题改为图标 `el-button`

- **选择**：复用顶栏已有 `icon-btn`，浅色显示 `Moon`，深色显示 `Sunny`，点击 `themeStore.toggle()`。`title` / `aria-label` 写「切换为深色」或「切换为浅色」。
- **原因**：顶栏左边已是图标按钮；去掉双边文案后窄屏不挤。
- **备选**：给 `el-switch` 换皮。仍是表单控件，和折叠按钮不齐。

## Risks / Trade-offs

- [只映射主色，EP 成功 / 危险色仍是默认] → 本轮可接受；停止钮不用 `type="danger"` 文字块，避免再露出默认红框皮。
- [圆形 `el-button` 默认 padding 把图标挤变形] → 用项目 class 固定宽高和 `circle` / 去内边距，而不是改 EP 源码。
- [深色下主色变 `#5b8cff`] → 分段选中与发送圆钮跟随 token，走查深浅各一次即可。

## Migration Plan

纯前端样式与三个组件的模板调整，无数据迁移。回滚即还原这几个文件。
