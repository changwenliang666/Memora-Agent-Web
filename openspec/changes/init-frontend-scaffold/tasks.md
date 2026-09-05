## 1. Bootstrap Vue + Vite + TypeScript

- [x] 1.1 在仓库根目录用 create-vue 生成 Vue 3 + TypeScript + Vite 工程（不要嵌套子目录），并确认生成 `package.json`、`vite.config.ts`、`tsconfig*.json`、`index.html`、`src/main.ts`
- [x] 1.2 删除 create-vue 默认演示组件与多余页面，按 design 建好 `src/assets`、`src/styles`、`src/router`、`src/views`、`src/stores`、`src/components`、`src/api`，并用 `ls src` 确认目录存在
- [x] 1.3 配置 `@` → `src` 别名（Vite 与 tsconfig paths 同步），新增 `typecheck`/`dev`/`build`/`preview` 脚本，写入 `packageManager: pnpm@...`，运行 `pnpm typecheck` 通过

## 2. Router, env, and README

- [x] 2.1 安装 `vue-router` 与 `pinia`，注册 `/` → `HomeView`，未知路径 `redirect: '/'`，在 `main.ts` 同时挂上 router 与 `createPinia()`
- [x] 2.2 添加 `.env.example`、`.env.development`、`.env.production`，写入 `VITE_API_BASE_URL`（开发默认 `http://localhost:8080`，生产为空），并确认示例文件不含真实密钥
- [x] 2.3 重写根 README：写明 Node 20+、pnpm，以及 `pnpm install` / `pnpm dev` / `pnpm typecheck` / `pnpm build`，通读确认新贡献者可按文档启动

## 3. HTTP client

- [x] 3.1 安装 `axios`，实现 `src/api/http.ts`：共享实例、JSON 默认头、15s 超时、`baseURL` 取 `VITE_API_BASE_URL`，相对路径且基址为空时抛出 `HttpConfigError`
- [x] 3.2 实现响应拦截器，将 4xx/5xx、超时、网络失败规范化为 `{ status?, message, code }`，并导出该错误类型供业务模块使用

## 4. App state

- [x] 4.1 实现 `src/stores/app.ts`：`defineStore` setup 语法，导出可读写计数与递增方法，确认可被 `@/stores/app` 导入

## 5. UI foundation and home page

- [x] 5.1 安装 `sass`、`element-plus`、`unplugin-vue-components`、`unplugin-auto-import`，按 Element Plus 官方 Vite 示例配置按需解析，并在 `main.ts` 引入 `element-plus/dist/index.css`
- [x] 5.2 新增 `src/styles/variables.scss`、`mixins.scss`、`index.scss`，用 Vite `additionalData` 注入变量，并在 `main.ts` 引入全局样式入口
- [x] 5.3 实现 `HomeView`：项目名、骨架说明、展示 store 计数、可点击 `el-button` 递增计数，样式引用全局 SCSS 变量；`App.vue` 只保留 `router-view`

## 6. Verify the scaffold

- [x] 6.1 运行 `pnpm typecheck` 与 `pnpm build` 均成功，确认 `dist/` 有构建产物
- [x] 6.2 运行 `pnpm dev`，浏览器打开 `/` 能看到项目标识、可交互 Element Plus 按钮、全局样式和 store 计数；点击按钮计数增加，访问未知路径再回首页后计数仍在
