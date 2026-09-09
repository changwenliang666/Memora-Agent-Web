## Context

见 `proposal.md` 的动机；行为见 `specs/knowledge-ingest/spec.md`。

现状：

- 直传三步已接通：`POST /files/presign` → 浏览器 `PUT` → `POST /files/complete`。`uploadKnowledgeFile` 把 `complete` 当终点，返回 `void`，忽略响应里的 `id` / `status`。
- `ingest` store 队列状态是 `waiting | processing | ready | failed`。上传成功写成 `ready` +「已上传」，录入页却把 `ready` 显示成「入库中」，且不再请求服务端。
- 队列项已有 `progress`，录入页未展示。`updateProgress` 挂在队列对象上，不利于状态同步。
- `listKnowledgeRecords` 返回三份写死记录；`loadRecords` 同一会话只拉一次。入库记录页文案写明「示例数据」。前端 `RecordStatus` 是 `processing | ready | failed`，后端是 `pending | processing | done | failed`。即使硬接列表，`done` 也会掉进「处理中」。
- Memora-Agent 已提供 `GET /files`（`limit` 默认 20、最大 100，`offset` 默认 0）和 `GET /files/{id}`，摘要不含正文。共享 `http` 会解信封，成功时 `data` 直接是数组或单个摘要。错误拦截器每次失败都会 toast。

约束：Vue 3 + Pinia + 现有 Axios 封装，不新增依赖，不改 FastAPI。

## Goals / Non-Goals

**Goals:**

- 在现有 `knowledge.ts` / `ingest` store / 两个页面里接上状态查询与真实列表。
- 队列状态与后端状态机对齐，并保留本地「尚未开始 / 正在直传」。
- 轮询失败不打断页面，也不用错误 toast 刷屏。
- 记录页用分页器对接 `limit` / `offset`；录入与记录在手机宽度下同样可读。

**Non-Goals:**

- 不改上传三步协议、白名单、大小上限。
- 不引入 WebSocket、EventSource 或新的进度百分比接口。
- 不做删除、重试、筛选、正文预览。
- 不把本次会话队列与入库记录页合并成同一张表。

## Decisions

### 1. 队列状态机与后端对齐，本地只多一个 uploading

- **选择**：队列项状态改为 `waiting | uploading | pending | processing | done | failed`。入队为 `waiting`；直传中为 `uploading`（沿用现有 `progress` 0–100）；`complete` 成功后写入返回的 `pending`（或当时的服务端状态），之后只跟 `GET /files/{id}`。终态 `done` / `failed` 停止跟踪。
- **原因**：现在的 `ready` 同时被 store 当成「已上传」、被页面当成「入库中」，和后端 `done` 也对不上。直接复用服务端四个值，页面只做文案映射。
- **备选**：保留 `ready` 再加 `ingestStatus`——调用方要组合两套状态。上传中也叫 `processing`——无法和入库 `processing` 区分。

页面映射：`waiting` → 等待，`uploading` → 上传中（可带百分比），`pending` → 排队中，`processing` → 处理中，`done` → 已完成，`failed` → 失败。映射函数放在 `knowledge.ts`，录入页与记录页共用。

直传结束后不再把上传百分比当作入库进度；入库只改标签与说明文案。

### 2. `complete` 返回文件 id，轮询放在 store 里

- **选择**：`uploadKnowledgeFile` 返回 `complete` 解信封后的 `{ id, status }`。`runUpload` 成功后调用 `GET /files/{id}`，每 2 秒一次，直到 `done` / `failed`。定时器存在 store（按文件 id 索引），刷新或退出登录时清掉。
- **原因**：规格要求跟踪持续到终态或离开应用会话；只在 `IngestView` 里轮询，切到记录页就会停。2 秒足够反映排队变化，MinerU 最长约 20 分钟，请求量可接受。
- **备选**：只在录入页 `onMounted` 轮询——切走就停，记录页看不到后续变化。WebSocket——后端没有。`setTimeout` 指数退避——本阶段状态只有四档，不必。

单次查询失败：保留最近状态与文件名，跳过这一拍，不把队列标失败（入队失败仍由 `complete` 的 HTTP 错误处理）。页面卸载不停止（规格是会话级）；`auth.clearSession` 或 store reset 时停止。

### 3. 轮询请求关闭自动 toast

- **选择**：共享客户端增加可选标记（例如 Axios config `skipErrorToast: true`）。`GET /files/{id}` 轮询带上该标记。列表首次加载失败仍走默认 toast，同时记录页展示错误文案。
- **原因**：拦截器现在每次 4xx/5xx 都 `ElMessage.error`。worker 未启动时文件会长时间 `pending`，网络抖动会每 2 秒弹一次。规格要求查询失败不能搞崩页面，也不该骚扰。
- **备选**：轮询改用裸 `axios`——会丢掉信封解包和 401 清会话。失败就把队列标 failed——一次超时会误报入库失败。

该标记只影响 toast，不改变规范化错误形状。

### 4. 记录页用 Element Plus 分页器，按页替换而不是追加

- **选择**：`listKnowledgeRecords({ limit, offset })` 打 `GET /files`。去掉 `recordsLoaded`。默认 `pageSize=20`，`offset = (page - 1) * pageSize`，翻页替换 `records`，不用「加载更多」。进入记录页回到第 1 页重拉。
- **原因**：后端已是 `limit` / `offset` 分页；用户要分页器。追加式加载和页码控件冲突。
- **备选**：加载更多——已否决。一次 `limit=100`——绕过分页器。改 FastAPI 返回 `total`——超出本仓库。

后端列表没有总数。分页器用本页是否满员推断：

- 本页 `length === pageSize` → 还有下一页，把 `total` 设为 `page * pageSize + 1`，让「下一页」可点。
- 本页不足 → 最后一页，`total = (page - 1) * pageSize + length`。
- 不提供跳转到任意大页的 jumper（总数是下界，跳页会空）。

字段映射：`id`（number）、`name` ← `filename`、`size`、`status`、`createdAt` ← 本地短日期时分、`errorMessage` ← `error_message`。不展示正文列、`object_key`、耗时字段。

### 5. 只刷新当前页上的非终态行

- **选择**：`RecordsView` 挂载且当前页有 `pending` / `processing` 时，每 3 秒用当前 `limit/offset` 再拉这一页。全部终态或离开页面则停。翻页后对新年窗口重新判断。
- **原因**：分页后没有「已加载窗口」可合并；刷新当前页即可看到排队变完成。
- **备选**：每条再打 `GET /files/{id}`——和队列轮询重复。

队列轮询与列表刷新独立，不把 `store.queue` 写入 records。

### 6. 录入页进度只在 uploading 展示，手机队列改为纵向

- **选择**：`progress` 仍是数字；`runUpload` 用闭包写 `item.progress`。`uploading` 显示进度条，进入 `pending` 后只保留状态文案。桌面队列：左文件名 / 右标签，进度条在文件名下全宽。手机（`<768`）：文件名、元信息、进度条、状态标签自上而下，标签不和文件名抢同一行。
- **原因**：窄屏一行 flex 会挤掉文件名或让进度条不可读。现有 `updateProgress` 挂在 reactive 对象上多余。
- **备选**：手机仍左右排布——文件名容易被截断。入库阶段进度条冻在 100%——看起来像已经完成。

失败文案：本地校验失败仍用现有短句；服务端 `error_message` 优先。

### 7. 分页器按断点换布局，记录页手机继续用卡片

- **选择**：沿用 `useBreakpoint`。`!isPhone`（平板 + 桌面）用表格 + `el-pagination`（`prev, pager, next`，`pager-count` 7）。`isPhone` 用卡片 + 小号分页器（`small`，`pager-count` 3，居中可换行）。空列表不渲染分页器。
- **原因**：规格要求桌面有页码、手机紧凑且不横向滚动。Element Plus 默认分页器在 375px 会溢出。
- **备选**：手机也上表格——旧规格已要求卡片。手机用加载更多——与分页器要求冲突。

## Risks / Trade-offs

- [worker 未启动，文件一直 pending] → 队列与记录页保持「排队中」并继续低频率查询；不在前端做超时判失败。
- [轮询期间 401] → 共享客户端仍清会话；跳转登录后 store 停表。
- [拦截器 toast 与队列文案重复] → 直传失败仍接受双提示；仅轮询关闭 toast。
- [无 total，页码总数是下界] → 用本页是否满员推断下一页；不做 jumper，避免跳到空白大页。
- [手机默认分页器溢出] → 小号、少页码、居中换行；走查 375px。
- [旧 mock 的 `ready` 文案残留] → 页面与类型一并改为 `done`，避免再把完成显示成处理中。
- [同时打开多个文件导致并行 GET] → 每文件独立 2 秒定时器，数量等于本次未完成上传，可接受。

## Migration Plan

- 无数据迁移。部署前端即可；需登录后才能打 `GET /files`。
- 回滚：恢复 `listKnowledgeRecords` mock、`uploadKnowledgeFile` 返回 void、去掉轮询与 `skipErrorToast`。
- 本地验收需 FastAPI 与 ingest worker 都在；只有 API 没有 worker 时，应能看到一直排队而不是前端误报完成。

## Open Questions

（无）
