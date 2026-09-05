## 1. Theme tokens and account label

- [x] 1.1 在 `src/styles/theme.scss` 为浅色 / 深色增加 `--color-avatar-bg`、`--color-avatar-text`，并在 `src/styles/variables.scss` 增加对应 SCSS 别名；打开样式入口确认两套模式下变量都存在
- [x] 1.2 在 auth store 或紧邻工具函数中提供可展示账号与后 3 位标签（去空白、`slice(-3)`、空则不可展示）；用 `alice123` / `ab` / 空白三种输入确认输出分别为 `123`、`ab`、不可展示

## 2. Header user menu

- [x] 2.1 新增 `src/layouts/UserMenu.vue`：圆形头像显示后 3 位或 `···`，靛蓝底白字，桌面 32px、手机 28px，`aria-label` / `title` 带完整账号或「账户菜单」；挂到页面后确认头像可见且不出现空白圆
- [x] 2.2 头像使用 `el-dropdown`（点击、`bottom-end`），菜单仅「退出登录」，弹出层用表面色、边框和弱化悬停；点击头像展开、点外部关闭，浅色 / 深色都可读
- [x] 2.3 选择「退出登录」调用现有 `clearSession` 并进入 `/login`；退出后再访问问答页会被守卫拦住

## 3. Shell wiring

- [x] 3.1 在 `AppLayout.vue` 的 `header-actions` 用 `UserMenu` 替换「退出」文字按钮，放在主题图标左侧；问答、录入、入库记录、用量页顶栏都只见头像和主题按钮
- [x] 3.2 确认登录页和手机抽屉都不出现头像或退出项；手机宽度下顶栏头像仍可点开「退出登录」

## 4. Verify

- [x] 4.1 运行 `pnpm typecheck` 通过
- [x] 4.2 在浏览器分别以桌面和手机宽度验证：头像后 3 位、下拉退出、主题按钮仍在、无独立「退出」文字；浅色 / 深色下头像与菜单对比正常
