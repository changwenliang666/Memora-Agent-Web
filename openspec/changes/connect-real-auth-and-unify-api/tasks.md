## 1. Unify API base URL

- [x] 1.1 将 `VITE_API_BASE_URL` 开发默认改为 `http://localhost:8000`；从 `env.d.ts`、`.env.example`、`.env.development`、`.env.production` 删除 `VITE_AGENT_API_BASE_URL`；更新 README 环境说明
- [x] 1.2 删除 `resolveAgentApiBaseURL`；局域网访问时把 API 基址改写为 `http://<当前主机>:8000` 而不是 Vite origin；`knowledge.ts` 的 presign/complete 改用默认共享客户端，不再传 Agent `baseURL`
- [x] 1.3 删除 Vite `/langgraph` 代理；`stream.ts` 不再请求 Node，未接通问答时直接走前端演示流

## 2. HTTP envelope and error toast

- [x] 2.1 在 `src/api/http.ts` 识别 `{code,message,data}`：成功码解开内层 `data`；无信封的成功响应保持原样；业务失败规范化后 reject，并带上信封 `message`
- [x] 2.2 共享客户端在业务失败、HTTP 错误、超时、网络失败时用 `ElMessage.error` 提示；成功不 toast；登录页去掉重复的错误 toast

## 3. Real login and register

- [x] 3.1 将 `src/api/auth.ts` 改为 `POST /auth/login` 与 `POST /auth/register`，请求体用 `username`/`password`；注册成功后立刻登录；从 JWT `exp` 写入 `expiresAt`
- [x] 3.2 登录/注册表单增加密码至少 6 位校验；短密码不发请求；确认密码仍只做前端校验

## 4. Verify

- [x] 4.1 运行 `pnpm typecheck` 通过，且未新增 npm 依赖
- [x] 4.2 浏览器走查：错误密码 toast 且不进工作台；注册成功进入工作台；刷新保持登录；问答仍可用演示流
