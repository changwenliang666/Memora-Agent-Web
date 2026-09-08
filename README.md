# Memora Agent Web

Memora Agent 的 Vue 3 前端：一套 RAG 知识库工作台，覆盖问答、文件录入、入库记录和用量统计。

默认进入知识问答页。桌面为可折叠侧栏 + 内容区；窄屏用同一套导航改为抽屉。支持浅色 / 深色模式，选择会写入本地存储。

## 功能

| 页面 | 路由 | 说明 |
|---|---|---|
| 知识问答 | `/knowledge/chat` | 单路会话；Enter 发送、Shift+Enter 换行；SSE 流式回答，可停止生成 |
| 知识录入 | `/knowledge/ingest` | 点击或拖拽入队；支持 `pdf` / `docx` / `txt` / `md` / `png` / `jpg` / `jpeg`，单文件不超过 100MB |
| 入库记录 | `/knowledge/records` | 查看文件名、大小、状态和时间；桌面表格，窄屏卡片 |
| 用量统计 | `/usage` | 按时 / 天 / 周 / 月 / 年查看问答与入库 token；折线、柱状、饼图读同一份数据 |

`/` 与 `/knowledge` 会重定向到 `/knowledge/chat`。

当前对接状态：

- **登录 / 注册**：开发环境默认请求 FastAPI `http://localhost:8000` 的 `/auth/login` 与 `/auth/register`。
- **问答**：FastAPI 问答流尚未接通，发送后走前端演示流，便于验收发送、停止和贴底滚动。
- **录入**：已配置 API 基址时按 `presign` → R2 `PUT` → `complete` 直传；入库记录与用量仍为演示数据。

## 技术栈

- Vue 3（Composition API、`<script setup>`）+ TypeScript
- Vite 8、Vue Router、Pinia
- Element Plus、Sass
- Axios（统一 HTTP 客户端）
- ECharts（用量图）
- pnpm 10

## 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`
- 包管理器：[pnpm](https://pnpm.io/) `10.x`（可用 `corepack enable` 启用）

## 开始使用

```bash
pnpm install
pnpm dev
```

开发服务会监听本机和局域网：

```
➜  Local:   http://localhost:5173/
➜  Network: http://<局域网 IP>:5173/
```

同一 Wi-Fi 下可用 Network 地址在手机或其他电脑打开。换网络后重新执行 `pnpm dev` 即可看到新的 IP。

## 常用脚本

| 命令 | 说明 |
|---|---|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动本地开发服务（含局域网访问） |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm build` | 类型检查并产出生产构建（`dist/`） |
| `pnpm preview` | 预览生产构建 |

## 环境变量

复制 `.env.example` 为本地环境文件。开发环境已提供 `.env.development`（默认 `http://localhost:8000`）。

| 变量 | 说明 |
|---|---|
| `VITE_API_BASE_URL` | FastAPI 基址。登录、注册、文件接口都拼到该地址后；未配置时，相对路径 HTTP 请求会被拒绝。 |

生产环境由部署注入 `.env.production` 中的值。不要把真实密钥写进仓库。

## 目录约定

```
src/
  api/          HTTP 客户端、问答流、知识库与用量接口
  composables/  断点等跨页逻辑
  layouts/      应用壳：侧栏 / 抽屉 / 顶栏
  router/       路由与导航数据
  stores/       Pinia：主题、会话、录入队列、用量
  styles/       主题令牌、混入与全局样式
  views/        知识库与用量页面
```

`@/` 指向 `src/`。页面组件顺序为 `<template>` → `<script>` → `<style>`。
