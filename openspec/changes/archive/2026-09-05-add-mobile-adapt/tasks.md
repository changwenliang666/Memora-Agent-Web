## 1. Breakpoint foundation

- [x] 1.1 在 `variables.scss` 增加 `$bp-md: 768px`、`$bp-lg: 1200px`，在 `mixins.scss` 增加 `phone` / `tablet` / `desktop` / `mobile`，并把 mixin 文件加入 Vite `additionalData`；在任意已有页面样式里写一处 `@include phone` 能成功编译
- [x] 1.2 新增 `src/composables/useBreakpoint.ts`：用 `matchMedia` 对齐同一组断点，导出 `isPhone` / `isTablet` / `isDesktop` / `isMobile`，卸载时取消监听；运行 `pnpm typecheck` 通过。首页不要引用该 composable

## 2. Global viewport baseline

- [x] 2.1 在 `index.html` 的 viewport 上增加 `viewport-fit=cover`；打开页面源码确认仍含 `width=device-width, initial-scale=1.0`
- [x] 2.2 在 `index.scss` 为 `html, body` 设置 `overflow-x: hidden`，并为 `body` 加上 `env(safe-area-inset-*)`；桌面宽度下打开首页确认现有居中与边距没有被挤乱

## 3. Home page

- [x] 3.1 保持 `HomeView.vue` 单一 template，仅在 `@include phone` 内收紧 padding 并略缩小标题；桌面规则留在选择器根上。桌面宽度下标题字号仍为 `$font-size-title`，手机宽度下标题与主内容无需左右滑动即可看完

## 4. Verify

- [x] 4.1 运行 `pnpm typecheck` 与 `pnpm build` 均成功
- [x] 4.2 在约 375px、768px、1280px 宽度验收首页：三种宽度都能看到标识、说明、计数、主题开关和按钮；375px 无横向滚动且控件可点；1280px 不是手机紧凑排版；缩窗口后计数与主题模式保持不变
