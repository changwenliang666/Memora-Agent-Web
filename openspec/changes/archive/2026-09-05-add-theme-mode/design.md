## Context

动机与范围见 `proposal.md`；行为契约见 `specs/theme-mode/spec.md`。

现状：颜色写在 `src/styles/variables.scss` 的编译期 SCSS 变量（`$color-primary` / `$color-text` / `$color-bg`），`index.scss` 与 `HomeView.vue` 直接引用，无法运行时换色。Element Plus 已按需接入，`main.ts` 引入全量浅色样式，尚未接暗色。Pinia 已有 `useAppStore`（演示计数），不负责主题。骨架变更明确不引入状态持久化插件。

## Goals / Non-Goals

**Goals:**

- 用同一套运行时令牌同时驱动项目样式和 Element Plus 外观。
- 用最少文件和最少令牌完成切换与持久化，后续加色只需补变量。
- 刷新后尽快恢复已保存模式，避免先闪浅色再变深色。

**Non-Goals:**

- 不引入主题库、CSS-in-JS 或 Pinia 持久化插件。
- 不跟随系统 `prefers-color-scheme`，不按时间自动切换。
- 不在本变更改 Element Plus 主色定制体系（仍用其默认组件色 + 官方暗色变量）。

## Decisions

### 1. 用 CSS 变量 + `html.dark`，而不是 SCSS 变量或 `data-theme`

- **选择**：在 `src/styles/theme.scss` 定义 CSS 变量。`:root` 为浅色，`html.dark` 为深色。切换时只给 `<html>` 加减 `dark`。
- **原因**：CSS 变量是运行时值，加新色只需补同名变量。Element Plus 官方暗色也认 `html.dark`，一套开关同时覆盖项目样式和组件库。
- **备选**：继续用 SCSS 变量无法运行时切换。只用 `data-theme="dark"` 语义更清晰，但还要额外同步 EP 的 `.dark`。单独引入主题库对当前需求过重。

### 2. 只放 4 个项目令牌，颜色沿用现有浅色并配一组简单深色

| 令牌 | 浅色 | 深色 |
| --- | --- | --- |
| `--color-bg` | `#f5f7fb`（现有背景） | `#111827` |
| `--color-text` | `#1f2937`（现有文字） | `#e5e7eb` |
| `--color-primary` | `#1a5cff`（现有主色） | `#5b8cff` |
| `--color-border` | `#d1d5db` | `#374151` |

- **选择**：4 个令牌够首页验收，也方便以后加 `--color-surface` 等。
- **原因**：用户要求少数、可扩展；主色在深色下略提亮，保证对比度。
- **备选**：把 Element Plus 全部 `--el-color-*` 重写一遍，范围过大且与「不改 EP 主色体系」冲突。

`variables.scss` 把现有颜色变量改成 CSS 变量别名，例如 `$color-text: var(--color-text)`，这样 `HomeView` 和 `index.scss` 不用改选择器也能跟主题走。间距、字号等非颜色变量保持编译期 SCSS 值。

### 3. 独立 Pinia store + 手写 `localStorage`，不塞进 `app` store

- **选择**：新增 `src/stores/theme.ts`。`mode` 为 `'light' | 'dark'`；`setMode` / `toggle` 先改 `document.documentElement` 的 `dark` class，再写入 `localStorage`，键名 `theme-mode`。非法或缺失值视为 `'light'`。
- **原因**：主题与演示计数职责不同；手写读写比加 `pinia-plugin-persistedstate` 更直接，也符合「不新增依赖」。
- **备选**：塞进 `useAppStore` 会把骨架演示状态和主题绑在一起。只在组件里读写 `localStorage` 无法保证启动时统一应用，也难复用。

### 4. 在 `index.html` 用一段同步脚本恢复 class，避免刷新闪白

- **选择**：`index.html` 增加极短内联脚本：读 `theme-mode`，值为 `dark` 时立刻给 `<html>` 加 `dark`。Pinia store 初始化时再读同一键，与 DOM 对齐。
- **原因**：等 `main.ts` 模块执行再加 class，深色用户会先看到浅色背景。内联脚本是常见、无新依赖的做法。
- **备选**：只在 `main.ts` 里应用更简单，但刷新深色会闪一下，不满足「尽快恢复」。

### 5. Element Plus 暗色用官方 CSS 变量文件

- **选择**：在 `main.ts` 增加 `import 'element-plus/theme-chalk/dark/css-vars.css'`。不改 EP 源码，不手写组件暗色覆盖。
- **原因**：官方方案与 `html.dark` 对齐，首页 `el-button` / `el-switch` 会跟着变。
- **备选**：全量自定义 EP 变量或换组件库，都超出本次范围。

### 6. 首页用 `el-switch` 切换，不自绘按钮

- **选择**：`HomeView.vue` 增加 `el-switch`，`active` 对应深色。文案标明浅色 / 深色。调用 theme store，不在页面里直接操作 `localStorage` 或 `document`。
- **原因**：项目约定优先 Element Plus；开关语义与双模式一一对应。
- **备选**：两个按钮或下拉对两种模式过重。

## Risks / Trade-offs

- [刷新仍可能短暂闪浅色] → 内联脚本在首屏 CSS 前加上 `dark`；主题变量放在全局样式入口尽早加载。
- [SCSS 颜色函数无法再处理这些变量] → 现有代码没有 `darken()` / `mix()`；约定颜色令牌只当值使用，需要计算时再补独立令牌。
- [隐私模式或禁用 `localStorage`] → 读写包在 try/catch 中，失败则本会话用内存态，默认浅色。
- [EP 暗色文件增大样式体积] → 官方暗色 CSS 体积可接受；不为此再引入构建插件。

## Migration Plan

- 新增 `theme.scss` 与 `stores/theme.ts`，改 `variables.scss`、`index.scss`、`main.ts`、`index.html`、`HomeView.vue`。
- 现有页面只要继续用 `$color-*` / 对应 CSS 变量，无需逐页改结构。
- 回滚：删除主题文件与内联脚本，把颜色变量改回十六进制即可。
- 无服务端数据迁移。
