## 1. HTTP 轮询错误不刷 toast

- [x] 1.1 在 `src/api/http.ts` 为请求增加 `skipErrorToast` 标记：为 true 时拦截器仍规范化并 reject，但不调用 `ElMessage.error`；默认行为不变。用一次故意失败的请求确认：无标记会 toast，有标记只 reject

## 2. 文件 API 与状态映射

- [x] 2.1 扩展 `src/api/knowledge.ts`：`IngestStatus` 改为 `waiting | uploading | pending | processing | done | failed`；删除 mock `listKnowledgeRecords`。`uploadKnowledgeFile` 返回 `complete` 的 `id` 与 `status`。新增 `getKnowledgeFile(id)`（`GET /files/{id}`，可传 `skipErrorToast`）和 `listKnowledgeRecords({ limit, offset })`（`GET /files`）。在 API 层把 `filename` / `created_at` / `error_message` 映射为页面字段，不读取正文列
- [x] 2.2 在 `knowledge.ts` 导出共用的状态文案与标签类型映射（等待 / 上传中 / 排队中 / 处理中 / 已完成 / 失败），确认 `done` 不会映射成处理中

## 3. 录入队列跟踪入库状态

- [x] 3.1 更新 `src/stores/ingest.ts`：去掉队列项上的 `updateProgress` 方法，直传中写 `uploading` 与 `progress`；`complete` 成功后写入文件 `id` 和服务端状态，每 2 秒 `getKnowledgeFile` 直到 `done` / `failed`。单次查询失败保留最近一次状态与文件名。退出登录或重置 store 时清掉定时器
- [x] 3.2 更新 `IngestView.vue`：使用共用状态映射；`uploading` 显示上传百分比，进入 `pending` 后不再把该百分比当作入库进度；失败展示 `error_message`。导语文案不再暗示上传完成即入库完成

## 4. 入库记录接真实列表与分页器

- [x] 4.1 更新 ingest store 的记录加载：去掉一次性 `recordsLoaded`；进入页面回到第 1 页（`offset=0`、`limit=20`）重拉；翻页用 `(page - 1) * pageSize` 替换当前页，不追加。用本页是否满员计算分页器 `total`。列表失败写入可读错误且不回填 mock
- [x] 4.2 更新 `RecordsView.vue`：去掉「示例数据」文案；桌面/平板表格 + 带页码的 `el-pagination`；手机卡片 + 小号紧凑分页器（居中、可换行）。失败显示原因；空列表不渲染分页器。当前页有 `pending` / `processing` 时每 3 秒刷新这一页，离开页面或翻页后按新年窗口判断

## 5. 移动端录入队列布局

- [x] 5.1 更新 `IngestView.vue` 窄屏样式：队列项改为文件名、说明、进度条、状态标签纵向排列；进度条仅 `uploading` 时全宽展示。375px 宽度下文件名不被截成不可读，无横向滚动

## 6. 验证

- [x] 6.1 运行 `pnpm typecheck` 通过，且未新增 npm 依赖
- [x] 6.2 浏览器桌面走查：上传成功后队列为排队中/处理中而非已完成；记录页是真实列表 + 分页器，满页可进下一页、可回上一页，不是加载更多
- [x] 6.3 浏览器 375px 走查：录入队列纵向可读；记录页卡片 + 紧凑分页器完整可见，无横向滚动
