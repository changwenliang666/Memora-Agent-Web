## 1. Theme tokens

- [x] 1.1 在 `src/styles/theme.scss` 的 `:root` 与 `html.dark` 将 `--el-color-primary` 映射到 `var(--color-primary)`，打开任意带主色按钮的页面确认不再是默认 `#409EFF`

## 2. Chat composer

- [x] 2.1 加高 `ChatView` 输入区：textarea 默认约两行高度，composer 内边距加大，保留 `max-height: 192px`，打开问答页确认空闲输入区不再是单行细条
- [x] 2.2 将发送 / 停止改为同一圆钮槽位：空闲显示上箭头发送（空内容禁用），`streaming` 时只显示中心方块停止钮，点击分别走现有 `submit` / `stop`；发送一条演示问题后确认发送消失、停止出现，点停止后发送恢复且 Enter / Shift+Enter 行为不变

## 3. Usage segmented

- [x] 3.1 为用量页 `el-segmented` 加上圆角容器与选中滑块皮肤（平台主色 / 圆角），打开用量页确认「天」等选中项不再是直角浅蓝块，切换到月后卡片与图表仍刷新

## 4. Header theme control

- [x] 4.1 顶栏去掉「浅色 / 深色」与 `el-switch`，改为 `icon-btn` + Moon/Sunny，点击调用 `themeStore.toggle()`；在任意页点击后立即换色，刷新后模式保持，顶栏不再出现双边文案

## 5. Verify

- [x] 5.1 在浏览器按问答（加高输入、发送/停止互斥、快捷键）→ 用量分段 → 顶栏主题（浅/深）走查一遍，并跑 `pnpm typecheck` 通过
