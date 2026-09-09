## Why

`GET /files/{id}` 已返回信封内 `data.status: "done"`，但录入页本次队列仍停在入库未完成态。用户无法从当前页面看出文件已经处理结束，只能靠开发者工具核对接口。

## What Changes

- 录入队列在收到文件详情接口的终态后，立刻把对应项改成可见的「已完成」或「失败」，不必离开页面或手动刷新。
- 轮询与上传回调写入的状态必须驱动界面更新；不得只改到脱离视图的对象副本上。
- 详情接口解信封后的 `data.status` 作为队列展示的来源；`done` / `failed` 后停止该文件的跟踪。
- 核对入库记录页：若当前页仍显示同一文件为排队/处理中，刷新后也必须跟上服务端终态。

不包含：改上传三步协议、改 FastAPI、引入 WebSocket、重试/删除、正文预览。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `knowledge-ingest`: 队列与记录页在文件详情/列表已给出 `done` 或 `failed` 时，必须把用户可见状态改成终态，且不得继续显示入库未完成。

## Impact

- 状态：`src/stores/ingest.ts` 中队列项的创建、轮询回写与停止跟踪。
- 映射：`src/api/knowledge.ts` 的 `getKnowledgeFile` / `toKnowledgeRecord` 对解信封后 `status` 的读取。
- 页面：`src/views/knowledge/IngestView.vue` 本次队列标签与文案；必要时核对 `src/views/knowledge/RecordsView.vue` 当前页刷新。
- 依赖：不新增 npm 包，不改 Agent 接口；继续使用现有共享 `http` 解信封。
