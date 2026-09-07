## ADDED Requirements

### Requirement: Auth APIs call FastAPI login and register

登录 MUST 通过独立鉴权模块调用 `POST /auth/login`，注册 MUST 调用 `POST /auth/register`。请求体 MUST 使用 `username` 与 `password`。页面 MUST NOT 直接拼请求。登录成功后 MUST 把返回的 token、过期时间与账号写入会话并进入工作台。注册成功且尚未登录时 MUST 立刻用同一组凭证登录，再进入工作台。后端返回业务失败时 MUST NOT 写入会话。

#### Scenario: Sign-in uses the login API

- **WHEN** 用户提交非空且符合长度要求的账号密码
- **THEN** 应用向登录接口发送 `username` 与 `password`，成功后写入会话并进入工作台

#### Scenario: Sign-up logs in after a successful register

- **WHEN** 用户提交符合要求的账号密码完成注册
- **THEN** 应用先完成注册，再调用登录接口，成功后写入会话并进入工作台

#### Scenario: Credential errors stay on the login page

- **WHEN** 登录或注册接口返回业务失败（例如用户名已存在、用户名或密码错误）
- **THEN** 不写入会话，用户仍停留在登录页，并能看到失败原因

### Requirement: Password meets the backend minimum length

登录与注册的密码 MUST 至少 6 个字符。短于该长度时 MUST NOT 发起请求。

#### Scenario: Short password is rejected

- **WHEN** 用户输入少于 6 个字符的密码并提交登录或注册
- **THEN** 不发起请求，页面提示密码长度不足

## MODIFIED Requirements

### Requirement: Session is stored locally and treated as expired when missing or stale

登录或注册成功后，应用 MUST 把会话（至少包含 token 与过期时间）写入 `localStorage`。过期时间 MUST 取自登录返回的 JWT `exp`。之后访问工作台时，应用 MUST 读取该会话。token 不存在或已过期时，应用 MUST 视为未登录。

#### Scenario: Successful auth persists a session

- **WHEN** 登录或注册成功
- **THEN** `localStorage` 中存在可用的 token 与过期时间

#### Scenario: Missing token is unauthenticated

- **WHEN** `localStorage` 中没有 token
- **THEN** 应用将用户视为未登录

#### Scenario: Expired token is unauthenticated

- **WHEN** `localStorage` 中的 token 已过期
- **THEN** 应用将用户视为未登录，并清除该失效会话

## REMOVED Requirements

### Requirement: Auth APIs are placeholders until the backend exists

**Reason**: Memora-Agent 已提供真实登录与注册接口，占位实现会放行任意账号。

**Migration**: 改由 `POST /auth/login` 与 `POST /auth/register` 完成鉴权；注册成功后自动登录。
