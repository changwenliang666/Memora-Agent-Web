## Context

动机见 `proposal.md`；行为见 `specs/responsive-layout/spec.md`。

现状：`index.html` 已有 `width=device-width`。首页是单列、`max-width: 640px`，手机上大致能看，但没有统一断点、安全区，也没有「何时用 CSS、何时拆模板」的约定。`mixins.scss` 只有 `flex-center`，且未注入到页面样式。主题色走 CSS 变量 + `html.dark`，与宽度适配正交，本变更不改主题机制。

约束：继续 Element Plus，不新增 UI 库或适配依赖；实现保持简单。

## Goals / Non-Goals

**Goals:**

- 先定一套后续页面都能跟的适配规则，再给首页做最小窄屏覆盖。
- 默认一套 SFC：样式分叉用断点 mixin，业务逻辑只写一次。
- PC 默认样式写在规则根上；窄屏覆盖必须包在媒体查询里，避免污染桌面。

**Non-Goals:**

- 不为首页做 `HomeMobile.vue`，不建 `/m` 路由。
- 不上 rem/vw 整页缩放，不引入 postcss-px-to-viewport。
- 不在本变更实现侧栏/抽屉等尚未存在的业务布局。

## Decisions

### 1. 默认响应式，结构差很大再拆布局壳

后续页面按下面三档选，禁止一上来就复制整页：

| 差异 | 做法 | 例子 |
| --- | --- | --- |
| 间距、字号、换列、按钮铺满 | **同一 SFC + 断点 mixin** | 首页、表单、简单列表 |
| DOM 结构不同，能力相同 | **同一页面拆布局壳**，逻辑放 composable / store | 桌面侧栏 vs 手机抽屉；桌面表格 vs 手机卡片 |
| 信息架构都不同 | 才考虑独立路由（本阶段不做） | 两套导航树 |

- **选择**：首页属于第一档，只改样式。`useBreakpoint` 现在就落地，供第二档使用，但首页不调用。
- **原因**：用户担心「一套功能写两次」。逻辑进 store/composable 后，分叉的只是排版，而不是计数、主题、接口。
- **备选**：全程两套页面——首页现在就会双份，后续必分叉。独立移动工程 / UA 分流对当前骨架过重。

布局壳约定（本变更只写进规范，不预创建文件）：`FooView.vue` 读 store 并按断点选择 `FooDesktop.vue` / `FooMobile.vue`；这两个文件只负责排版，不发请求、不写 `localStorage`。

### 2. 三个宽度档，桌面优先写样式

| 档 | 宽度 | 首页处理 |
| --- | --- | --- |
| 手机 | `< 768px` | 收紧 padding、略缩小标题，主内容仍单列 |
| 平板 | `768px–1199px` | 接近桌面单列，只保证不溢出 |
| 桌面 | `≥ 1200px` | 保持现有 `640px` 居中与现有字号边距 |

- **选择**：`$bp-md: 768px`、`$bp-lg: 1200px`。mixin：`phone`、`tablet`、`desktop`、`mobile`（`< 1200px`，手机+平板共用）。
- **原因**：三档够用；首页结构简单，平板不必单独一套。桌面优先是因为现有页面已按宽屏写，窄屏覆盖进 mixin 就不会改到桌面选择器。
- **备选**：mobile-first 更「教科书」，但要把现有规则全搬进 `desktop` mixin，改动面大且易漏。Element Plus 断点（768/992/1200）更细，992 对本项目没有对应布局，不加。

### 3. 用媒体查询，不用 rem/vw 缩放，也不引入第二套组件库

- **选择**：断点写在 `variables.scss` / `mixins.scss`。Vite `additionalData` 同时注入二者，页面可直接 `@include phone`。Element Plus 继续用，控件在窄屏保持默认可点尺寸。
- **原因**：EP 按 px 设计，全局 rem/vw 会把按钮和弹层一起缩小，难控。Vant 与「不随意引入其他 UI 库」冲突，和 EP 两套视觉。
- **备选**：`postcss-px-to-viewport` 对 EP 不友好。只靠 flex 不建断点，后续页面会各写各的 `max-width`。

### 4. JS 断点只服务结构分叉

- **选择**：`src/composables/useBreakpoint.ts` 用 `matchMedia` 对应同一组 768 / 1200，导出 `isPhone` / `isTablet` / `isDesktop` / `isMobile`。监听 `change`，组件卸载时取消。首页不引用。
- **原因**：抽屉 vs 侧栏必须在运行时选组件；间距变化不该走 JS。和 CSS 用同一数值，避免「样式认为是手机、JS 认为是平板」。
- **备选**：只做 CSS 则第二档没有统一入口。放进 Pinia 对无状态的视口信息过重。看 `navigator.userAgent` 无法处理桌面浏览器缩窗口，也违反规格。

### 5. 视口、安全区、防横向溢出作为全局底线

- **选择**：`viewport` 增加 `viewport-fit=cover`。`index.scss`：`html, body { overflow-x: hidden; }`；`body` 使用 `env(safe-area-inset-*)`。首页 padding 叠一层安全区，避免刘海挡住标题。
- **原因**：规格要求按设备宽度缩放、内容进入安全区。这是几行全局 CSS，不必按页重复。
- **备选**：只改首页——新页面会漏。忽略安全区——刘海机标题可能被挡。

### 6. 首页只做最小窄屏覆盖

- **选择**：保持单一 template。`@include phone` 内降低标题字号与 `.home` padding；主题开关和按钮不换控件。平板不改结构。
- **原因**：首页已是单列居中，大改没有收益。主题开关行为已由 `theme-mode` 覆盖，本变更只保证窄屏也能点。
- **备选**：把开关改成底部栏——超出「可查看」范围。

## Risks / Trade-offs

- [后续有人仍复制整页] → design 写明三档表；实现时不预创建 Mobile 空文件，避免暗示「先拆再写」。
- [EP 复杂表格在手机上难用] → 本变更范围外；到那一页用第二档（表格/卡片），仍共用同一套请求与状态。
- [桌面优先导致移动默认偏宽] → 首页用 mixin 收紧；新页面默认先按桌面写，再补 `phone`。
- [安全区在桌面无效果] → `env()` 无安全区时为 0，桌面布局不变。

## Migration Plan

- 新增断点变量、mixin、`useBreakpoint`；改 `vite.config.ts` 的 `additionalData`、`index.html` viewport、`index.scss`、`HomeView` 窄屏样式。
- 不改路由、Pinia 主题/计数、HTTP 客户端。
- 回滚：撤掉上述文件改动即可，页面行为回到仅桌面排版。
