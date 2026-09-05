## 1. Inventory

- [x] 1.1 列出仓库内全部 `.vue`（排除 `node_modules`、`dist`），记录每个文件当前顶层块顺序，并对照约定标出需要调整的文件

## 2. Reorder existing components

- [x] 2.1 将 `src/App.vue` 调整为 `template` → `script`，保留 `script setup lang="ts"` 与模板内容；打开文件确认 `template` 在文件最上方
- [x] 2.2 将 `src/views/HomeView.vue` 调整为 `template` → `script` → `style`，保留各块属性与块内内容；打开文件确认三块按该顺序出现
- [x] 2.3 若清单中还有其他违规 `.vue`，按同样规则整块搬移（多个 `style` 保持原有先后）；再次列出全部 `.vue`，确认不再存在 `script` 或 `style` 出现在 `template` 之前的文件

## 3. Verify behavior

- [x] 3.1 运行 `pnpm typecheck` 成功
- [x] 3.2 在浏览器打开首页：根路径仍渲染首页，标题、计数、主题开关可见；点击计数与切换主题的行为与重排前一致
