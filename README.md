# Memora Agent Web

Memora Agent 的 Vue 3 前端工程。

## 环境要求

- Node.js `^22.18.0` 或 `>=24.12.0`
- 包管理器：[pnpm](https://pnpm.io/) `10.x`（可用 `corepack enable` 启用）

## 开始使用

```bash
pnpm install
pnpm dev
```

开发服务启动后，在浏览器打开终端提示的本地地址（默认 `/` 为首页）。

## 常用脚本

| 命令 | 说明 |
|---|---|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动本地开发服务 |
| `pnpm typecheck` | 运行 TypeScript 类型检查 |
| `pnpm build` | 类型检查并产出生产构建（`dist/`） |
| `pnpm preview` | 预览生产构建 |

## 环境变量

复制 `.env.example` 为本地环境文件。开发环境已提供 `.env.development`。

| 变量 | 说明 |
|---|---|
| `VITE_API_BASE_URL` | HTTP 客户端的 API 基址。未配置时，相对路径请求会被拒绝。 |

发请求前请先配置基址；生产环境由部署注入 `.env.production` 中的值。
