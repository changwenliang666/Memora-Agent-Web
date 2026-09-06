## Why

知识库录入页已有拖拽区和队列，但上传仍是本地延时占位，文件不会进入 Cloudflare R2。服务端已提供 `POST /files/presign` 与 `POST /files/complete`，前端需要按这条直传链路接通，用户才能真正把文档送进对象存储。

## What Changes

- 把 `uploadKnowledgeFile` 的占位实现换成三步上传：向 FastAPI 申请预签名地址、浏览器 `PUT` 到 R2、再调用 `complete` 回传元数据。
- 新增 `VITE_AGENT_API_BASE_URL`，开发默认 `http://localhost:8000`（与 FastAPI / Uvicorn 默认端口一致），与现有问答 Node 服务的 `VITE_API_BASE_URL` 分开。
- 录入校验与服务端对齐：仅 `pdf` / `txt` / `md`，单个文件不超过 100MB。
- 共享 HTTP 客户端读取 FastAPI 的 `detail` 字段，使队列失败文案能看到服务端原因。
- 录入页文案去掉「演示 / 未接通」表述。

不包含：问答 Node 服务与 `/langgraph` 代理、入库记录落库、进度条、S3 / AWS SDK、改 FastAPI 上传协议。FastAPI 的浏览器 CORS 在服务端仓库另开变更处理。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `knowledge-ingest`: 上传从占位改为直传 R2；类型与大小限制与服务端对齐。
- `http-client`: 规范化错误需吸收 FastAPI `detail`；Agent 文件接口使用独立基址，不占用问答基址。

## Impact

- API：`src/api/knowledge.ts` 接通真实上传；`src/api/http.ts` 补 `detail` 解析。
- 状态与页面：`src/stores/ingest.ts`、`src/views/knowledge/IngestView.vue` 更新限制与文案；记录页仍用 mock。
- 环境：`.env.example` / `.env.development` / `.env.production` / `env.d.ts` 增加 `VITE_AGENT_API_BASE_URL`。
- 依赖：不新增 npm 包；`PUT` 使用现有 Axios，且不得走带 JSON 默认头的共享实例。
