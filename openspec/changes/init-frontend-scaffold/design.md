## Context

仓库是空的前端项目（见 `proposal.md` 的 Why），根目录只有 OpenSpec 与空 README，没有 `package.json` 或 `src/`。实现必须在仓库根目录直接建工程，而不是嵌套子应用。行为契约见 `specs/project-scaffold`、`specs/http-client`、`specs/ui-foundation`、`specs/app-state`。

约束：Node.js 20+、包管理器 pnpm、Vue 3 Composition API + `<script setup>`、不引入鉴权 / i18n。

## Goals / Non-Goals

**Goals:**

- 用官方 Vite + Vue 模板在根目录生成可维护的 TS 工程，再按本仓库约定改目录和脚本。
- 用一套共享 Axios 实例满足环境基址、超时和错误规范化。
- 用 Element Plus 按需引入 + 全局 SCSS 变量，让首页成为可目视验收的骨架页。
- 用 Pinia 提供一个可演示读写的应用 store，证明状态层已接通。

**Non-Goals:**

- 不设计业务 API 模块、鉴权头或 refresh token。
- 不引入状态持久化插件、单元测试框架或 CI。
- 不把 OpenSpec 目录迁走或改成 monorepo。

## Decisions

### 1. 用 `create-vue` 生成后再裁剪，而不是手写全部配置

- **选择**：在仓库根目录用官方 `create-vue`（Vue 3 + TypeScript + Vite）生成，再删掉默认演示页，补上本仓库目录、Sass、Axios、Element Plus、Pinia 和路由。
- **原因**：Vite / `vue-tsc` / `tsconfig` 路径别名的官方组合比手写更少踩坑。
- **备选**：`npm create vite@latest` 更轻，但后续仍要手加 Vue Router 与 TS 严格配置；完全手写配置成本高，且容易漏掉 `vue-tsc`。

### 2. 目录与别名

```
src/
  assets/
  styles/          # 全局 SCSS 入口、variables、mixins
  router/
  views/           # 页面
  stores/          # Pinia 模块
  components/      # 后续业务组件（骨架期可仅占位）
  api/             # 共享 HTTP 客户端；业务接口后续放这里
  App.vue
  main.ts
```

- `@` → `src`，同时写进 Vite `resolve.alias` 和 `tsconfig` `paths`。
- 路由只注册 `/` → `HomeView`；未知路径 `redirect: '/'`，避免空白页。不单独做 404 页。

### 3. 环境变量

- 使用 Vite 约定：`.env.development`、`.env.production`，以及提交到仓库的 `.env.example`。
- 唯一骨架变量：`VITE_API_BASE_URL`。开发默认 `http://localhost:8080`，生产默认空字符串（由部署注入）。
- `.env.production` 不写入真实密钥。HTTP 客户端在基址为空时拒绝相对路径请求。

### 4. HTTP 客户端

- **选择**：`src/api/http.ts` 导出一个 Axios instance；默认 `timeout: 15000`、`headers['Content-Type'] = application/json`。
- 请求拦截器：相对 URL 且 `baseURL` 为空时抛出 `HttpConfigError`。
- 响应拦截器：把 Axios 错误收成 `{ status?: number, message: string, code: 'http' | 'timeout' | 'network' | 'config' }`。
- **备选**：`ofetch` / `ky` 更现代，但需求明确指定 Axios；全局 `axios` 默认实例会污染后续测试与多基址场景。

### 5. Element Plus 按需引入

- **选择**：`unplugin-vue-components` + `unplugin-auto-import` + `ElementPlusResolver`，首页直接写 `<el-button>`，不必在 `main.ts` 全量 `app.use(ElementPlus)`。
- 样式：在 `main.ts` 引入 `element-plus/dist/index.css`（骨架期优先保证可见；主题定制留后续）。
- **备选**：全量注册更简单但体积大；手动按文件导入每个组件对骨架验收过重。

### 6. Sass 组织

- `src/styles/variables.scss`、`src/styles/mixins.scss`、`src/styles/index.scss`。
- Vite `css.preprocessorOptions.scss.additionalData` 自动注入 variables，页面 `<style lang="scss">` 可直接用变量。
- `main.ts` 引入 `styles/index.scss` 作为全局入口（reset / 基础排版）。

### 7. 脚本与包管理

- `packageManager` 字段锁定 pnpm；脚本：`dev`、`build`（`vue-tsc -b && vite build`）、`typecheck`（`vue-tsc -b --noEmit`）、`preview`。
- 不在本变更引入 ESLint/Prettier，避免把“能跑起来”和“规范工具链”绑在一起。

### 8. Pinia 共享状态

- **选择**：安装 `pinia`，在 `main.ts` 里 `app.use(createPinia())`。
- `src/stores/app.ts` 用 `defineStore` 的 setup 语法导出 `useAppStore`，至少包含一个可读写计数（如 `visitCount`）和一个递增 action。
- 不引入 `pinia-plugin-persistedstate`；跨刷新丢失是预期行为。
- **备选**：组件 `ref` 只能覆盖单页，无法满足导航后仍保留；Vuex 已不是 Vue 3 默认方案。

### 9. 首页验收

- `HomeView` 展示项目名、一句骨架说明、一个可点击的 `el-button`，并使用全局颜色变量，证明路由 + 组件 + SCSS 已接通。
- 首页读取并展示 `useAppStore` 的计数；点击按钮调用递增，证明状态层可用。未知路径回首页后计数仍在。
- 不在首页真实调用后端；HTTP 客户端用类型导出和模块结构验收即可，需要的话可在实现时加一个不自动触发的示例函数。

## Risks / Trade-offs

- [create-vue 会生成多余演示文件] → 生成后立即删除默认 `HelloWorld` / 多余 view，只保留约定目录。
- [按需插件增加构建复杂度] → 遵循 Element Plus 官方 Vite 示例；若插件冲突则退回全量注册，行为不变。
- [空 `VITE_API_BASE_URL` 导致相对请求失败] → 这是规格要求；README 写明必须配置基址才能发请求。
- [未引入 ESLint] → 类型检查能挡住一部分错误；规范工具链另开变更。

## Migration Plan

- 本变更是绿场初始化：直接在根目录写入工程文件，覆盖空 README。
- 回滚：删除本变更新增的前端文件即可，OpenSpec 目录不受影响。
- 无需数据迁移或分阶段发布。
