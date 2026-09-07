## Why

登录与注册仍是本地占位，任意非空账号都能进工作台；Memora-Agent 已提供真实 `/auth/login` 与 `/auth/register`。同时前端还在用两套基址（问答 Node `:3000` 与 FastAPI `:8000`），业务错误是 HTTP 200 + `{code,message,data}`，当前拦截器既不解信封也不提示，密码错误会被当成成功。

## What Changes

- 登录 / 注册改为调用 FastAPI：`POST /auth/login`、`POST /auth/register`；注册成功后立刻用同一组凭证登录，再写入会话并进入工作台。
- 会话 token 与过期时间取自登录返回的 JWT（读 `exp`）；账号展示用返回的 `username`。
- 共享 HTTP 客户端识别统一信封 `{code,message,data}`：`code === 0` 时把响应体换成内层 `data`；`code !== 0` 或 HTTP 错误时 `ElMessage.error` 展示 `message`。成功不 toast。
- **BREAKING**：删除 `VITE_AGENT_API_BASE_URL`。只保留 `VITE_API_BASE_URL`，开发默认 `http://localhost:8000`。登录、注册、文件接口都走这一基址。
- 问答不再请求 Node `/langgraph/agent-run`，未接通真实问答时继续用前端演示流。删除 Vite `/langgraph` 代理。
- 局域网打开开发页时，API 基址改写为 `http://<当前主机>:8000`，而不是 Vite 源站。
- 注册密码前端校验与后端对齐：至少 6 位。

不包含：改 Memora-Agent、接通 FastAPI 问答流、验证码 / OAuth / 找回密码、成功 toast、入库记录与用量的真实接口。

## Capabilities

### New Capabilities

- 无。

### Modified Capabilities

- `auth`: 占位登录 / 注册改为真实 FastAPI 鉴权；注册成功后自动登录进入工作台。
- `http-client`: 统一信封解包；业务失败与 HTTP 失败 toast 错误；去掉独立 Agent 基址。
- `knowledge-chat`: 问答不再打 Node 网关，未接通时只用前端演示流。
- `project-scaffold`: 环境变量只保留 FastAPI 基址。

## Impact

- API：`src/api/auth.ts` 接真实接口；`src/api/http.ts` 解信封并 toast；`src/api/knowledge.ts` 与 `src/api/stream.ts` 不再使用第二基址或 Node 路径。
- 状态与页面：`src/stores/auth.ts` 仍写 token / expiresAt / account；`LoginView.vue` 去掉页面级错误 toast，补密码长度校验。
- 环境：`.env.*`、`env.d.ts`、`README.md`、`vite.config.ts` 去掉 Agent 基址与 `/langgraph` 代理。
- 依赖：不新增 npm 包；toast 用已有 Element Plus `ElMessage`。
