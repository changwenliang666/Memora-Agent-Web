## Context

见 `proposal.md` 的动机。现状：

- 登录页、守卫、Pinia 会话、退出已经落地；`src/api/auth.ts` 仍是本地假 token。
- 共享 Axios 默认 `VITE_API_BASE_URL`（开发为 Node `:3000`），文件上传另用 `VITE_AGENT_API_BASE_URL`（`:8000`）。
- 拦截器只把 HTTP 4xx/5xx 当失败。Memora-Agent 业务失败是 HTTP 200 + `{code,message,data}`，`code !== 0`。
- FastAPI 登录返回 `{token,user_id,username}`，JWT `exp` 默认 7 天；注册只返回 `{user_id,username}`，不发 token。字段是 `username` / `password`，密码最少 6 位。
- `/files/presign` 成功体仍是裸 `{upload_url,...}`；`/files/complete` 与鉴权走信封。
- 问答 `stream.ts` 先打 `/langgraph/agent-run`，失败再演示流。Vite 代理 `/langgraph` → `:3000`。

约束：Vue 3 Composition API、Axios 统一封装、Element Plus、不新增依赖。不改 Memora-Agent。

## Goals / Non-Goals

**Goals:**

- 用同一套 Axios 拦截器解信封、把业务失败变成错误，并只 toast 错误。
- 登录 / 注册打真实 FastAPI；注册成功后自动登录。
- 全站只认一个 FastAPI 基址；问答在未接通前走演示流。

**Non-Goals:**

- 不接 FastAPI `/chat/stream`（仍是非 SSE 桩）。
- 不改登录页布局、不增加成功 toast。
- 不把入库记录 / 用量接到真实接口。

## Decisions

### 1. 信封在响应拦截器解开，调用方继续 `const { data } = await http.post`

- **选择**：HTTP 200 且 body 含数字 `code` 时视为信封。`code === 0` 把 `response.data` 换成内层 `data` 再交给 Axios。`code !== 0` 规范化后 reject。没有 `code` 的 JSON（如 presign）原样返回。
- **原因**：现有 `knowledge.ts` 已按 Axios 信封读 `data`；改调用约定会扩散。
- **备选**：每个 API 自己解包——登录、complete、以后接口会重复。把整封 `{code,message,data}` 交给调用方——每个模块都要判断 `code`。

成功码与后端 `BizCode.SUCCESS = 0` 对齐。

### 2. 错误 toast 只放拦截器，成功不弹

- **选择**：信封失败、HTTP 错误、超时、网络失败用 `ElMessage.error(message)`。登录页去掉 `catch` 里的 toast。R2 `PUT` 仍走独立 `axios.put`，不进这套拦截器。
- **原因**：用户要求接口错误有提示、成功不要 toast；集中处理避免漏网和重复。
- **备选**：页面各自 toast——会和拦截器重复。成功也 toast——已否决。

上传失败会同时出现队列文案和 toast，可接受。

### 3. 注册成功后立刻 login，JWT 只读 `exp`

- **选择**：`register()` 内部：`POST /auth/register` 成功后再 `POST /auth/login`，返回与登录相同的会话。`expiresAt = jwt.exp * 1000`；解码失败则回退 7 天。账号用返回的 `username`。表单仍显示「账号」，请求体映射为 `username`。
- **原因**：后端注册不发 token；现有「注册并进入」和 spec 要求进工作台。前端不验签。
- **备选**：注册后停在表单让用户再登录——和现有按钮文案冲突。改后端发 token——超出本仓库。

密码规则：`el-form` 增加最少 6 位，避免无意义的 422。

### 4. 只留 `VITE_API_BASE_URL=http://localhost:8000`

- **选择**：删除 `VITE_AGENT_API_BASE_URL`。`http` 默认基址即 FastAPI。`knowledge.ts` 不再传 per-request `baseURL`。开发局域网访问时，把 `localhost` 换成当前 hostname、端口保持 8000（`http://<host>:8000`），不再改写到 Vite origin。
- **原因**：用户确认 Node 问答只是 demo；FastAPI 已 CORS `*`。改写到 Vite origin 后没有 `/auth` 代理，登录会打空。
- **备选**：Vite 代理全部 FastAPI 路径——多一层，局域网还要配代理。保留第二基址——已否决。

删除 `vite.config.ts` 的 `/langgraph` 代理。`stream.ts` 不再请求 Node，直接走演示流。

### 5. 规范化错误带上业务 `code`

- **选择**：`NormalizedHttpError` 增加可选数字 `bizCode`。HTTP 状态仍用 `status`。信封失败 `code: 'http'`（或沿用现有联合类型并加业务码字段），`message` 取信封 `message`。
- **原因**：调用方一般只展示 message；保留 bizCode 便于以后分支。
- **备选**：用 HTTP 状态假装业务失败——后端明确用 200 + code，不能伪装成 4xx。

## Risks / Trade-offs

- [把非信封 JSON 误判成信封] → 只在 `typeof code === 'number'` 且同时有 `message` 时解包；presign 没有 `code`。
- [JWT 前端可篡改 exp] → 与现有 localStorage 会话同一等级；真正过期由后端 401 清会话。
- [局域网 FastAPI 未监听 0.0.0.0] → 手机打不开 API；开发需让 Uvicorn 绑 `0.0.0.0`。
- [演示流不再尝试真实问答] → 本阶段接受；接通 `/chat` SSE 另开变更。
- [拦截器 toast 与队列文案重复] → 接受，保证接口失败一定可见。

## Migration Plan

- 开发把 `VITE_API_BASE_URL` 改为 `http://localhost:8000`，删掉 Agent 变量后重启 Vite。
- 已写入的占位 `demo.*` token 会 401，拦截器清会话并送回登录页。
- 回滚：恢复占位 `auth.ts`、双基址和 `/langgraph` 代理。
