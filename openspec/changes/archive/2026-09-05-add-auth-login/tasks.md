## 1. Session and placeholder APIs

- [x] 1.1 新增 `src/api/auth.ts` 占位 `login` / `register`：非空账号密码延迟后返回 `token`、`expiresAt`（7 天）、`account`，空凭证抛出规范化错误
- [x] 1.2 新增 Pinia `src/stores/auth.ts`：从 `localStorage` 键 `memora.auth` 读写会话，过期即清除，提供 `isAuthenticated`、`setSession`、`clearSession`
- [x] 1.3 共享 HTTP 客户端在有效会话时附加 `Authorization: Bearer <token>`，收到 401 时调用清会话；用现有基址校验逻辑确认未登录请求不加认证头

## 2. Routing and shell

- [x] 2.1 `App.vue` 改为根 `router-view`；`/login` 为公开路由，知识库与用量挂到 `AppLayout` 子路由，未匹配路径仍回问答
- [x] 2.2 增加全局前置守卫：无会话或过期跳 `/login?redirect=`（仅接受站内相对路径）；已登录访问登录页则进 `redirect` 或 `/knowledge/chat`
- [x] 2.3 工作台顶栏增加「退出」：清除会话并进入登录页，主题按钮仍在

## 3. Login page

- [x] 3.1 新增登录页：居中卡片、品牌标、主题切换、登录/注册分段、账号密码（注册含确认密码），沿用现有主题 token 与 Element Plus 表单
- [x] 3.2 提交走占位接口并写入会话；空字段不请求；成功后跳 `redirect` 或问答页；失败用 Element Plus 提示

## 4. Verification

- [x] 4.1 无 token、过期 token 访问工作台会进登录页；登录后能进原目标页；退出后再访问会被拦住
- [x] 4.2 运行 `pnpm typecheck` 通过，并在浏览器走通登录、注册、主题切换与退出
