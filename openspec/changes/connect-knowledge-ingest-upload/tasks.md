## 1. Environment and HTTP client

- [x] 1.1 在 `env.d.ts`、`.env.example`、`.env.development`、`.env.production` 增加 `VITE_AGENT_API_BASE_URL`；开发默认 `http://localhost:8000`，示例与生产留空；确认 `VITE_API_BASE_URL` 与 `/langgraph` 代理未改
- [x] 1.2 调整 `src/api/http.ts`：规范化错误优先读取响应体 `detail`（字符串或数组首项），再回退 `message`；用 FastAPI 风格错误体确认队列能看到原因而不是只显示 `Bad Request`

## 2. Upload API

- [x] 2.1 将 `src/api/knowledge.ts` 的 `MAX_FILE_SIZE` 改为 `104857600`，`ALLOWED_EXTENSIONS` 改为 `pdf` / `txt` / `md`；删除占位延时与文件名含 `fail` 的演示失败
- [x] 2.2 实现 `uploadKnowledgeFile`：按扩展名映射 `content_type`，用共享 `http` 带 `VITE_AGENT_API_BASE_URL` 调用 `POST /files/presign` 与 `POST /files/complete`；未配置 Agent 基址时抛出可识别配置错误
- [x] 2.3 用独立 Axios `PUT` 把文件传到 `upload_url`，`Content-Type` 与申报一致，不带 Authorization，超时足够传 100MB；确认页面与 `knowledge.ts` 均未引入 AWS / S3 SDK

## 3. Queue and ingest page

- [x] 3.1 更新 `src/stores/ingest.ts`：非法类型或超 100MB 入队即失败且不调用上传；成功/失败文案去掉「演示」；`docx` 或超限文件入队后可见失败且无预签名请求
- [x] 3.2 更新 `IngestView.vue`：`accept` 与提示改为 pdf / txt / md、单个不超过 100MB，去掉演示队列文案；记录页仍使用 mock，不以完整历史表替代队列

## 4. Verify

- [x] 4.1 运行 `pnpm typecheck` 通过，且 `package.json` 未新增依赖
- [x] 4.2 在浏览器走查录入页：合法小文件三步成功后队列为已就绪；缺 Agent 基址、非法类型、超限文件分别失败且页面不崩溃；问答页仍走原 Node 基址
