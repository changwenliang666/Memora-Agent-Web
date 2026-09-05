# vue-sfc-structure Specification

## Purpose

约定 Vue 单文件组件的顶层块顺序，使仓库内现有和后续组件都以同一阅读顺序组织，且调整顺序不得改变组件对外表现。

## Requirements

### Requirement: Vue SFC top-level blocks follow a fixed order

每个 Vue 单文件组件 MUST 按以下相对顺序排列顶层块：先 `template`，再 `script`，最后 `style`。组件可以缺少其中一块或多块；只要某块存在，它 MUST 出现在上述顺序中更靠前的已有块之后、更靠后的已有块之前。同一文件中可以有多个 `style` 块，它们 MUST 全部位于 `script`（如有）之后，并保持彼此原有先后关系。

#### Scenario: File containing template, script, and style

- **WHEN** 开发者打开一个同时包含 `template`、`script` 和 `style` 的 Vue 单文件组件
- **THEN** 文件中这三个顶层块按 `template`、`script`、`style` 的顺序出现

#### Scenario: File containing only template and script

- **WHEN** 开发者打开一个只有 `template` 和 `script`、没有 `style` 的 Vue 单文件组件
- **THEN** `template` 出现在 `script` 之前

#### Scenario: File containing only template and style

- **WHEN** 开发者打开一个只有 `template` 和 `style`、没有 `script` 的 Vue 单文件组件
- **THEN** `template` 出现在 `style` 之前

### Requirement: Reordering blocks does not change component behavior

调整顶层块顺序 MUST NOT 改变组件的模板结构、脚本语义或样式规则。用户可见的页面内容、交互和外观 MUST 与重排前一致。

#### Scenario: Home page still renders after reorder

- **WHEN** 开发者将首页组件的顶层块调整为约定顺序并启动应用
- **THEN** 首页仍展示原有标题、说明、计数和主题开关，且计数与主题切换行为与重排前一致

#### Scenario: App root still renders the routed view

- **WHEN** 开发者将根组件的顶层块调整为约定顺序并访问根路径
- **THEN** 应用仍渲染当前路由对应的页面，而不是空白页
