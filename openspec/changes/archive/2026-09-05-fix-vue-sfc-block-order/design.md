## Context

动机与范围见 `proposal.md`；行为契约见 `specs/vue-sfc-structure/spec.md`。

现状：仓库内只有两个 Vue 单文件组件，块顺序都不符合约定。

| 文件 | 当前顺序 | 目标顺序 |
| --- | --- | --- |
| `src/App.vue` | `script` → `template` | `template` → `script` |
| `src/views/HomeView.vue` | `script` → `template` → `style` | `template` → `script` → `style` |

工程没有 ESLint / Prettier 配置，也没有 `vue/block-order` 一类自动修复规则。Vue SFC 编译器不依赖顶层块书写顺序，因此重排只影响源码阅读，不改变运行时。

## Goals / Non-Goals

**Goals:**

- 用最小改动把现有 `.vue` 对齐约定顺序。
- 实现时再扫一遍仓库，避免只改已知的两个文件而漏掉新增文件。
- 重排后页面行为与重排前一致。

**Non-Goals:**

- 不引入 ESLint、Prettier 或格式化脚本。
- 不改组件内部实现、属性、空白语义以外的内容。
- 不改 `openspec/config.yaml`（约定已写在那里）。

## Decisions

### 1. 手工移动顶层块，不加 lint 自动修复

- **选择**：直接编辑每个违规 `.vue`，把整块 `template` / `script` / `style` 按约定顺序拼接回去；块上的属性（如 `setup`、`lang="ts"`、`lang="scss"`、`scoped`）原样保留。
- **原因**：当前只有两个文件，加 ESLint 或 Prettier 会引入新依赖和配置，超出「只改顺序」的范围。
- **备选**：加 `eslint-plugin-vue` 的 `vue/block-order` 可长期约束，但本变更明确不新增依赖。后续若接入 lint，再把该规则当作执行手段即可。

### 2. 以整块为单位剪切，不重写块内内容

- **选择**：识别每个顶层块的起止标签，整段搬移；块与块之间保留一个空行。不格式化模板、脚本或样式内部。
- **原因**：避免把「调顺序」变成无关的 diff，方便核对行为未变。
- **备选**：顺手跑一遍格式化会扩大 diff，也没有项目级格式化配置可复用。

### 3. 实现时全量扫描 `**/*.vue`，不写死文件清单

- **选择**：apply 阶段再列出仓库内全部 `.vue`（排除 `node_modules`、`dist`），按约定检查并修正。规划时已知的两个文件是起点，不是上限。
- **原因**：从提案到实现之间可能新增组件；用户要求「整个项目」对齐。
- **备选**：只改 `App.vue` 和 `HomeView.vue` 更省事，但无法满足全量对齐。

## Risks / Trade-offs

- [漏改后续新增的 `.vue`] → 实现第一步先全量列出文件，再逐个对照顺序。
- [搬移时丢失块属性或块内空行] → 以整块剪切粘贴，改完后目视对照每个开始标签的属性是否仍在。
- [无自动规则，以后又写回 script 在前] → 接受；规范已在 `openspec/config.yaml`，本变更不加 lint。若后续接入 ESLint，再补 `vue/block-order`。

## Migration Plan

- 一次性改完源码即可，无需数据迁移或分批发布。
- 回滚：按文件还原块顺序，或 `git checkout` 对应 `.vue`。
