## 1. Theme tokens

- [x] 1.1 新增 `src/styles/theme.scss`：在 `:root` 与 `html.dark` 中定义 `--color-bg`、`--color-text`、`--color-primary`、`--color-border`（取值见 design），并从 `src/styles/index.scss` 引入；打开全局样式入口确认两套变量都存在
- [x] 1.2 将 `src/styles/variables.scss` 中的颜色变量改为对应 CSS 变量别名，间距和字号保持编译期 SCSS 值；运行 `pnpm typecheck` 确认现有页面样式仍能编译

## 2. Theme state and persistence

- [x] 2.1 新增 `src/stores/theme.ts`：`mode` 为 `'light' | 'dark'`，提供 `setMode` / `toggle`，读写 `localStorage` 键 `theme-mode`，同步 `html.dark`，非法或缺失值回退浅色；在控制台切换一次后确认 class 与存储值一致
- [x] 2.2 在 `index.html` 增加同步内联脚本：当 `theme-mode` 为 `dark` 时立刻给 `<html>` 加上 `dark`；本地写入 `dark` 后刷新，确认首屏已带 `dark` class

## 3. UI wiring

- [x] 3.1 在 `main.ts` 引入 `element-plus/theme-chalk/dark/css-vars.css`；给 `<html>` 手动加 `dark` 后确认 Element Plus 控件进入暗色样式
- [x] 3.2 在 `HomeView.vue` 增加 `el-switch`（开启=深色），文案标明浅色 / 深色，只通过 theme store 切换，页面不直接写 `localStorage` 或 `document`；打开首页确认开关可见且状态与当前模式一致

## 4. Verify

- [x] 4.1 运行 `pnpm typecheck` 与 `pnpm build` 均成功
- [x] 4.2 在浏览器验证：无存储时默认浅色；开关可立即切换深浅色（页面颜色与 Element Plus 控件都变）；刷新后恢复上次模式；把 `theme-mode` 改成非法值再刷新会回退浅色
