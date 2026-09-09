## 1. 详情状态映射

- [x] 1.1 调整 `src/api/knowledge.ts` 的 `getKnowledgeFile` / `toKnowledgeRecord`：只从文件摘要读取 `status`；若误收到带内层 `data` 的信封则读内层；摘要缺少 `status` 时不要用 `pending` 覆盖调用方已有状态。用 `{ code: 0, data: { status: "done", filename, id, size, created_at, error_message: null } }` 形状确认映射结果为 `done`

## 2. 队列回写打到响应式项

- [x] 2.1 更新 `src/stores/ingest.ts`：入队后按本地 `id`（有 `fileId` 时也可按文件 id）从 `queue` 取出当前项，再写 `status` / `message` / `progress` / `fileId`。`runUpload`、进度回调和 `startPolling` 都走这一条，不再改入队前的裸对象
- [x] 2.2 保持终态行为：`complete` 或 `GET /files/{id}` 得到 `done` / `failed` 时立刻回写可见状态并停该文件轮询；非终态继续每 2 秒查询。单次查询失败仍保留最近一次状态与文件名

## 3. 验证

- [x] 3.1 运行 `pnpm typecheck` 通过，且未新增 npm 依赖
- [x] 3.2 浏览器录入页：上传一份会入库的文件并留在本页；待网络面板中 `GET /files/{id}` 的 `data.status` 为 `done` 后，该队列项标签和说明变为「已完成」，不再显示排队中、处理中或上传中
- [x] 3.3 浏览器入库记录页：同一文件在列表刷新（或重新进入页面）后显示为已完成，而不是处理中。若本步失败，再修 `RecordsView` 当前页刷新，直到列表 `status: done` 时标签为已完成
