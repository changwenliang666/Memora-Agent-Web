## Why

Memora-Agent 已把入库从请求内同步改为队列：`POST /files/complete` 立刻落 `pending` 行并入队，随后可用 `GET /files/{id}` 轮询、`GET /files` 看当前用户文件。前端仍在 complete 后把队列标成「已上传」，入库记录页继续展示 mock 示例，用户看不到真实排队、处理、成功或失败。

## What Changes

- 上传完成确认成功后，用返回的文件 `id` 轮询 `GET /files/{id}`，把本次队列从「已上传」推进到排队、处理中、已完成或失败。
- 入库记录页改为请求 `GET /files`，去掉 mock 数据和「示例数据」文案；状态标签与后端 `pending` / `processing` / `done` / `failed` 对齐。
- 列表按后端 `limit` / `offset` 翻页，页面提供分页器（不是「加载更多」）。桌面显示页码；手机用紧凑分页器，不出现横向滚动。
- 录入队列与入库记录在手机宽度下同步可用：队列项纵向排布并展示进度，记录页继续用卡片。
- 失败时展示服务端 `error_message`；进入记录页时重新拉取当前页。
- 队列在直传阶段继续展示上传百分比；入库阶段以离散状态为准（后端没有百分比进度）。

不包含：改 Memora-Agent 协议、WebSocket 推送、删除/重试接口、正文预览、分片上传。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `knowledge-ingest`: 录入队列在直传成功后继续反映服务端入库状态；入库记录页改为真实列表并带分页器；手机与桌面布局同步可用。

## Impact

- API：`src/api/knowledge.ts` 让 `complete` 返回文件 `id` 与 `status`，新增按 id 查询与列表查询。
- 状态与页面：`src/stores/ingest.ts`、`src/views/knowledge/IngestView.vue`（含手机纵向队列）、`src/views/knowledge/RecordsView.vue`（表格/卡片 + 分页器）。
- 依赖：不新增 npm 包，不改 FastAPI；轮询走现有共享 `http` 客户端（`VITE_API_BASE_URL`）。
