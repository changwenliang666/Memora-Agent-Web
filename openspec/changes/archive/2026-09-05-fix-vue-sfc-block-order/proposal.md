## Why

项目约定 Vue 单文件组件的顶层块顺序为 `<template>`、`<script>`、`<style>`，但现有 `.vue` 文件仍是 `<script>` 在前。顺序不统一会增加阅读成本，后续新增组件也容易继续偏离约定。需要在文件还少时一次性对齐。

## What Changes

- 扫描仓库内全部 `.vue` 文件，把顶层块顺序调整为：`<template>` → `<script>`（如有）→ `<style>`（如有）。
- 约定该顺序为后续 Vue 组件的默认写法；缺少某一块时，其余块仍保持相对顺序。
- 只移动顶层块位置，不改模板内容、脚本逻辑、样式规则或标签属性。

不包含：新增 ESLint / Prettier 规则或依赖、改写组件实现、调整 `openspec/config.yaml` 中的规范条文、修改非 `.vue` 文件。

## Capabilities

### New Capabilities

- `vue-sfc-structure`: Vue 单文件组件顶层块必须按 template、script、style 排列，且重排不得改变组件行为。

### Modified Capabilities

- 无。主规格目录尚无已归档能力；本变更只约束 `.vue` 文件块顺序，不改路由、主题、响应式或 HTTP 行为。

## Impact

- 代码：当前至少 `src/App.vue`、`src/views/HomeView.vue` 需要重排；实现时需再扫一遍全部 `.vue`，避免遗漏。
- 行为：对用户可见的页面、主题切换、计数等功能不变。
- 依赖：不新增 npm 包，不改构建或类型检查配置。
