## Context

见 `proposal.md` 的动机；可见行为见 `specs/knowledge-ingest/spec.md`。

现状（只读代码）：

- `GET /files/{id}` 经共享 `http` 解信封后，`getKnowledgeFile` 把 `data.status` 映射为 `FileStatus`，轮询在 `ingest` store 的 `startPolling` 里每 2 秒调用一次。
- 队列项是普通对象，`unshift` 进 `queue` 后，`runUpload` / `applyServerStatus` / 进度回调仍闭包改**入队前那份引用**。Vue 3 把数组里的元素做成 proxy 后，改原始对象不会触发视图更新，网络面板里已经是 `done`，录入页标签仍停在排队中或处理中。
- 详情映射若拿到的是未解包信封（顶层没有 `status`），`coerceFileStatus` 会写成 `pending`，轮询也不会把 `done` 当终态停掉。需要在回写前确认读的是摘要上的 `status`。
- 入库记录页用整页替换 `records`，与队列闭包不是同一条路径；只验收当前页刷新是否把列表里的 `done` 显示出来。

约束：Vue 3 + Pinia，不新增依赖，不改 FastAPI 与上传三步。

## Goals / Non-Goals

**Goals:**

- 轮询或 `complete` 得到 `done` / `failed` 后，录入页当前队列的标签和说明立刻变成终态。
- 状态写入打在视图正在渲染的那条队列项上。
- `GET /files/{id}` 的 `status` 按解信封后的摘要读取；`done` / `failed` 停止该文件轮询。

**Non-Goals:**

- 不改轮询间隔、不改上传协议、不上 WebSocket。
- 不把本次队列与入库记录表合并。
- 记录页刷新策略仅在验收失败时再动。

## Decisions

### 1. 状态回写走 store 里的响应式队列项，不改入队前的裸对象

- **选择**：入队后所有 `status` / `message` / `progress` / `fileId` 的写入，都按本地 `id`（或已有 `fileId`）从 `queue` 里取出当前项再改。上传进度回调同样找这一条。
- **原因**：模板渲染的是 `queue` 里的 proxy。继续改 `enqueue` 里创建的原始对象，接口已经 `done` 也不会重绘。
- **备选**：入队前 `reactive()` 包一层——闭包能用，但以后若再拷贝对象仍会漏更新。整项不可变替换（`splice` 新对象）——也能触发更新，改动面比按 id 回写大。

### 2. 详情接口只信任摘要上的 `status`

- **选择**：`getKnowledgeFile` 继续使用解信封后的文件摘要。映射前确认对象自身带 `status`（以及 `filename` / `id`）；若误收到带 `data` 嵌套的信封，从内层摘要读，禁止把缺失的 `status` 当成 `pending` 覆盖轮询结果。
- **原因**：用户抓到的响应是 `{ code: 0, data: { status: "done" } }`。若映射读到外层，`status` 为 `undefined`，会被写成 `pending`，页面永远到不了已完成。
- **备选**：轮询改打裸 `axios`——会丢掉解信封和 401 处理。忽略映射、在 store 里直接读 `response.data.data.status`——和现有客户端约定重复。

`complete` 返回已是终态时，仍立即展示并**不要**再开轮询；非终态才按文件 id 轮询，直到 `done` / `failed`。

### 3. 记录页先验收，不默认改刷新

- **选择**：实现后在入库记录页走一遍「当前页原为处理中 → 列表返回 `done`」。若标签已变成已完成，则不改 `RecordsView` 的 3 秒刷新。
- **原因**：记录页是整表赋值，不是队列那种闭包改裸对象；用户复现用的是 `GET /files/{id}`，主路径在录入队列。
- **备选**：记录页也改打 `GET /files/{id}`——和队列轮询重复，本次不做。

## Risks / Trade-offs

- [改原始对象时进度条看起来像在动，状态标签却卡住] → 进度与状态走同一条按 id 回写，避免一个响应式、一个不响应式。
- [映射仍把 `done` 收成 `pending`] → 回写前校验摘要字段；验收时对照网络面板与队列标签。
- [记录页列表接口慢于详情接口] → 队列以详情为准；记录页等到列表刷新即可，不在队列里写 records。

## Migration Plan

- 只发前端。回滚即恢复 `ingest` store（及必要时 `knowledge.ts`）的回写方式。
- 验收：上传一份会入库的文件，保持在录入页，待 `GET /files/{id}` 的 `data.status` 为 `done` 后，队列标签变为「已完成」且不再显示处理中；再打开入库记录页确认同一文件为已完成。

## Open Questions

（无）
