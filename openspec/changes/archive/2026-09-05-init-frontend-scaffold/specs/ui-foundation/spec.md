## Purpose

让页面能使用统一的 UI 组件库和全局 SCSS 样式，并通过首页证明组件与样式已经接通。

## ADDED Requirements

### Requirement: UI components are available in pages

页面 MUST 能直接使用项目选定的 UI 组件库，无需每个页面重复注册基础组件。

#### Scenario: Home page renders a library component

- **WHEN** 用户打开首页
- **THEN** 页面至少展示一个来自 UI 组件库的可见控件（例如按钮或标题），且控件可交互

### Requirement: Global SCSS styles compile and apply

工程 MUST 支持 SCSS，并提供全局样式入口以及可复用的基础变量或混入。页面样式 MUST 能引用这些全局定义。

#### Scenario: Global styles load on home page

- **WHEN** 用户打开首页
- **THEN** 页面应用来自全局样式入口的基础排版或颜色，而不是完全未样式化的浏览器默认外观

#### Scenario: Page stylesheet uses shared variables

- **WHEN** 首页或布局样式引用共享 SCSS 变量
- **THEN** 开发服务和生产构建都能成功编译这些样式

### Requirement: Home page verifies the UI stack

首页 MUST 作为骨架验收页，同时证明路由、UI 组件、全局样式和共享状态已接通，而不是只显示构建工具默认欢迎文案。

#### Scenario: Visual verification of the scaffold

- **WHEN** 开发者启动开发服务并打开根路径
- **THEN** 首页同时包含项目标识、至少一个 UI 组件库控件、可辨认的全局样式效果，以及来自共享状态的可见值
