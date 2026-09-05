## Why

当前页面颜色写在编译期 SCSS 变量里，无法在运行时切换深浅色，刷新后也无法记住用户选择。项目需要一套最小、可扩展的主题色配置，让用户能在浅色和深色之间切换，并在刷新后恢复上次选择。

## What Changes

- 增加浅色 / 深色两种颜色模式；首次访问默认浅色。
- 用户选择写入 `localStorage`；页面刷新后按本地存储恢复，而不是回到默认浅色。
- 用少量 CSS 变量承载主题色（背景、文字、主色等），后续只需加变量，不必改切换机制。
- 在 `src/views/HomeView.vue` 增加 Element Plus 开关，供用户切换模式。
- 页面与全局样式改为消费这些 CSS 变量，使首页在切换后立即换色。

不包含：跟随系统偏好、多套品牌色盘、主题编辑器、按时间自动切换、为持久化单独引入 Pinia 插件。

## Capabilities

### New Capabilities

- `theme-mode`: 浅色 / 深色模式切换、本地持久化恢复，以及少量可扩展的主题 CSS 变量。

### Modified Capabilities

- 无。主规格目录尚无已归档能力；本变更只引入 `theme-mode`。

## Impact

- 样式：`src/styles/` 增加主题 CSS 变量，现有 SCSS 颜色引用改为走变量。
- 状态：新增主题状态（Pinia），读写 `localStorage`。
- 页面：`HomeView.vue` 增加模式开关；`main.ts` / 启动流程在渲染前应用已保存模式。
- 依赖：不新增 npm 包；复用已有 Pinia、Element Plus 与 Sass。
- Element Plus：接入其官方暗色 CSS 变量，使组件随项目模式一起变色。
