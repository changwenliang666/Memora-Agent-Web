## Context

动机见 `proposal.md`；行为见 `specs/knowledge-ingest/spec.md`、`specs/http-client/spec.md`。

现状：`IngestView` 用 `el-upload` 选文件，`ingest` store 做本地校验后调用 `uploadKnowledgeFile`。该函数仍是延时占位，文件名含 `fail` 才失败。页面文案写明「演示队列」。允许类型为 `pdf` / `txt` / `md` / `docx`，上限 20MB。`listKnowledgeRecords` 仍是 mock。

共享 Axios 实例默认基址是 `VITE_API_BASE_URL`（开发为问答 Node：`http://localhost:3000`），超时 15s，默认 `Content-Type: application/json`，有会话时带 Bearer。错误规范化只读 `data.message`。FastAPI 文件接口在 `http://localhost:8000`，错误体是 `detail`。

服务端约定：`POST /files/presign` → 浏览器 `PUT upload_url`（`Content-Type` 必须与申报一致）→ `POST /files/complete`。允许 `.pdf` / `.md` / `.txt`，1～100MB。`complete` 不落库。浏览器 CORS 由 FastAPI 仓库另开变更处理；R2 桶 CORS 仍在控制台配置。

## Goals / Non-Goals

**Goals:**

- 在现有 API / store / 页面分层里接通三步直传，页面不出现云存储 SDK。
- 用第二套环境变量指向 FastAPI，不改问答基址和 Vite `/langgraph` 代理。
- 本地校验与服务端白名单对齐，失败原因能显示到队列。

**Non-Goals:**

- 不新增 npm 依赖，不引入 AWS / S3 SDK。
- 不改问答、用量、登录占位，不把记录页接到 `complete`。
- 不做上传进度条、分片、重试队列或取消上传。
- 不在本仓库配置 FastAPI CORS 或 R2 桶 CORS。

## Decisions

### 1. 替换 `uploadKnowledgeFile`，不新开 API 模块

- **选择**：继续由 `src/api/knowledge.ts` 导出 `uploadKnowledgeFile(file, onProgress?)`。内部顺序：`presign` → `PUT` → `complete`。`el-upload` 仍 `auto-upload=false`，真正发送只走该函数。
- **原因**：现有 store / 规格已经以这个函数为替换点；再拆 `api/files.ts` 只是换文件名。
- **备选**：页面 `action` 直打预签名地址——校验、完成确认和错误处理会漏回组件。新开模块——当前只有这一处调用，过早。

### 2. Agent 基址用 `VITE_AGENT_API_BASE_URL`，两次 JSON 请求复用共享客户端

- **选择**：开发默认 `http://localhost:8000`。`presign` / `complete` 调用共享 `http` 时传入该 `baseURL`。未配置则抛现有 `HttpConfigError`，store 把队列标失败。
- **原因**：Uvicorn 未指定端口即 8000；与 `VITE_API_BASE_URL` 分开，避免文件请求打到 Node。共享实例已有认证头和错误规范化，不必第二套封装。
- **备选**：改问答基址为 8000——会弄断 `/langgraph`。Vite 代理 `/files`——本变更已确认由 FastAPI 放宽 CORS，前端直打源站即可。

`env.d.ts`、`.env.example`、`.env.development`、`.env.production` 同步加该变量；生产默认空字符串。

### 3. 直传 `PUT` 用独立 Axios 调用，不走共享实例

- **选择**：`axios.put(upload_url, file, { headers: { 'Content-Type': 申报值 }, timeout: 0, onUploadProgress })`。不带 Authorization，不使用默认 JSON Content-Type。
- **原因**：预签名把 `ContentType` 写进签名；多出来的头或 `application/json` 会导致 R2 拒签。15s 超时扛不住 100MB。
- **备选**：`fetch`——没有现成上传进度回调，而函数签名已有 `onProgress`。共享 `http.put`——拦截器和默认头会污染签名。

`content_type` 按扩展名映射：`.pdf` → `application/pdf`，`.txt` / `.md` → `text/plain`。不直接使用可能为空的 `file.type`。

### 4. 校验常量与服务端对齐，页面去掉 docx

- **选择**：`MAX_FILE_SIZE = 104_857_600`，`ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md']`。store 在入队时拦截，不发 `presign`。`IngestView` 的 `accept` 与提示改为这三类、100MB。
- **原因**：服务端不收 `docx`；前端 20MB 会误拒合法文件。
- **备选**：保留 docx 等服务端 400——用户体验差。做成可配置上限——超出本次范围。

队列状态机保持 `waiting | processing | ready | failed`。成功文案改为已上传，不再写「演示」。

### 5. 规范化错误优先读 `detail`

- **选择**：`http.ts` 的错误消息顺序为 `detail` → `message` → `statusText`。`detail` 为数组时取第一项可读字符串。
- **原因**：FastAPI `HTTPException` 与校验失败都走 `detail`；不改则队列只能看到 `Bad Request`。
- **备选**：只在 `knowledge.ts` 里解析——其他 Agent 接口以后还会踩同样的坑。

## Risks / Trade-offs

- [R2 桶未配 CORS] → 浏览器 `PUT` 失败；队列标失败。桶策略不在本仓库，需在 Cloudflare 控制台允许前端源的 `PUT` 与 `Content-Type`。
- [FastAPI CORS 未先合并] → `presign` / `complete` 预检失败。与服务端 `add-permissive-cors` 一起验收。
- [预签名 15 分钟过期] → 单文件 100MB 在常规网络下足够；过期视为上传失败，不做自动续签。
- [通配 CORS + 前端仍可能带 Bearer] → 文件接口当前不校验登录；不在 PUT 上带认证头。收紧鉴权留到以后。
- [complete 不落库] → 记录页继续 mock，避免用户以为已入库。文案保持「记录与本次队列分开」。

## Migration Plan

- 先配 `VITE_AGENT_API_BASE_URL`，再替换占位上传并收紧类型 / 大小。
- 回滚：恢复 `uploadKnowledgeFile` 占位、去掉 Agent 环境变量、`http.ts` 仍可读 `message`。
- 无数据迁移。
