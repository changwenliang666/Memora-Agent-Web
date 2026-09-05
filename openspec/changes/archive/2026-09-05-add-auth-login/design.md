## Context

见 `proposal.md` 的动机。当前 `App.vue` 无条件挂载 `AppLayout`，所有路由都在壳内；`http` 只校验基址、不带认证头；没有会话 store。知识库级联导航、问答贴底与 Enter 发送已经落地，本次不改那些行为。

约束：Vue 3 + Pinia + Vue Router + Axios + Element Plus；鉴权模块与页面分离；本阶段没有真实登录 / 注册后端。

## Goals / Non-Goals

**Goals:**

- 用路由守卫挡住无 token / 过期 token，而不是在每个页面里判断。
- 登录页独立于工作台壳，视觉沿用现有 token（主色、表面色、品牌标）。
- 占位接口可被日后的 `POST /auth/login`、`POST /auth/register` 整段替换，调用方不变。

**Non-Goals:**

- 不实现真实密码校验、验证码、OAuth。
- 不在占位阶段把登录打到 `VITE_API_BASE_URL`（避免 15s 超时）。
- 不改问答、录入、用量的业务逻辑。

## Decisions

### 1. 根路由拆成「公开登录」和「壳内工作台」

`App.vue` 只留 `<router-view />`。`/login` 渲染登录页；其余业务路由作为 `AppLayout` 的子路由。

备选：登录页也塞进壳再隐藏侧栏。否决，因为会露出工作台导航，和「未登录不能进工作台」打架。

### 2. 会话放 Pinia，源是 localStorage

存储一份 JSON：`token`、`expiresAt`、`account`。键名 `memora.auth`。`isAuthenticated` = token 存在且 `expiresAt > now`。过期时读取即清除。

备选：只存 token、自行解析 JWT `exp`。否决，占位 token 不是 JWT，过期时间必须显式存放。

### 3. 占位接口在 `src/api/auth.ts`，本地成功

`login` / `register` 校验非空后短暂延迟，返回 `{ token, expiresAt, account }`，过期时间为本机 7 天。函数签名按真实接口预留（账号、密码）。页面只调这两个函数。

备选：先打真实 HTTP 再回落。否决，开发环境基址指向未实现的 8080，每次登录会等到 Axios 超时。

### 4. 守卫记 redirect，成功后回跳

未登录访问 `/usage` → `/login?redirect=/usage`。`redirect` 只接受站内相对路径，拒绝协议或外域，避免开放重定向。已登录访问 `/login` → `redirect` 或 `/knowledge/chat`。

### 5. HTTP 拦截器读会话、处理 401

请求拦截器在有效会话时加 `Authorization: Bearer <token>`。响应 401 时清会话；路由守卫或后续导航会送到登录页。不在拦截器里直接 `router.push`，避免和进行中的导航抢状态；由守卫统一跳。

### 6. 登录页用 Element Plus 表单 + 分段切换

`el-segmented` 或 `el-tabs` 切换登录 / 注册；`el-form` + `el-input`。卡片居中，左上品牌标与侧栏同一套「M」，右上主题图标。注册增加「确认密码」，仅前端校验，不进占位接口。

顶栏退出用文字按钮「退出」，不另做账户下拉，避免第一期空账户中心。

## Risks / Trade-offs

- [占位任意账号都能进] → 本阶段接受；接口替换后由后端拒绝。页面提示保持中性，不写「演示密码」。
- [localStorage 可被脚本读取] → 与现有主题存储同一等级；真实环境后续再谈 HttpOnly cookie。
- [7 天过期不便手动验过期] → 守卫同时认「无 token」和「expiresAt 已过」；开发可用控制台改 `expiresAt` 验证。
- [401 不立刻跳转] → 清会话后下一次导航或刷新会被守卫拦住；工作台内若正在停留，退出按钮仍是主动离开的入口。

## Migration Plan

无数据迁移。上线后未登录用户第一次打开会被送到 `/login`。回滚即去掉守卫与 `/login` 路由，恢复 `App.vue` 直接挂壳。
