## Why

Memora-Agent-Web 目前只有空仓库和 OpenSpec 规划目录，无法启动、开发或联调任何前端页面。现在需要先落地一套可运行的 Vue 3 工程骨架，后续业务功能才能在统一的构建、样式和请求约定上展开。

## What Changes

- 从零初始化 Vue 3 + TypeScript + Vite 前端工程，补齐开发、类型检查和构建脚本。
- 接入 Sass，建立全局样式入口和基础变量/混入，页面样式统一走 SCSS。
- 接入 Element Plus，使组件可在页面中直接使用，并提供一条可见的首页验证路径。
- 接入 Axios，提供可复用的 HTTP 客户端，基址从环境变量读取。
- 接入 Pinia，提供可被页面导入的共享状态模块，并在首页用一次读写证明已接通。
- 建立约定的源码目录、路径别名和路由入口，使后续页面、状态与接口模块有固定落点。
- 更新根 README，说明如何安装依赖、启动开发和构建。

## Capabilities

### New Capabilities

- `project-scaffold`: 工程可安装、启动、类型检查和构建；约定目录、路径别名、环境变量、路由首页和 Pinia 共享状态。
- `http-client`: 共享 Axios 实例、环境基址、拦截器与统一错误形状，业务模块可直接调用。
- `ui-foundation`: Element Plus 与 Sass 基础样式可用，首页能展示组件并应用全局样式。
- `app-state`: 应用级共享状态可被页面读写，刷新前状态在会话内保持一致。

### Modified Capabilities

- 无。仓库尚无主 specs。

## Impact

- 影响范围：整个空仓库根目录（新增 `package.json`、Vite/TS/Sass 配置、`src/`、环境文件和 README）。
- 新增依赖：`vue`、`vue-router`、`pinia`、`typescript`、`vite`、`sass`、`axios`、`element-plus` 及其官方推荐的按需插件与类型包。
- 不引入鉴权、i18n 或真实后端对接；这些留待后续变更。
- 包管理器约定为 pnpm；Node.js 使用当前 LTS（20+）。
