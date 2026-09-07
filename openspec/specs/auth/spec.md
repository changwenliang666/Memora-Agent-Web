# auth Specification

## Purpose

为工作台提供登录与注册入口，用本地会话挡住未登录和过期访问，并通过对接 FastAPI 鉴权接口完成登录、注册与进入工作台。

## Requirements

### Requirement: Login page supports sign-in and sign-up

应用 MUST 提供独立的登录页。该页 MUST 同时支持登录和注册，用户可以在两者之间切换而不离开当前页。注册 MUST 只要求用户手动输入账号和密码。账号或密码为空时 MUST NOT 提交。

#### Scenario: Visitor opens the login page

- **WHEN** 用户打开登录页
- **THEN** 页面展示登录表单，并可切换到注册表单

#### Scenario: User signs in with account and password

- **WHEN** 用户在登录表单输入非空账号和密码并提交
- **THEN** 应用调用登录接口，成功后进入工作台

#### Scenario: User registers with account and password

- **WHEN** 用户切换到注册，输入非空账号和密码并提交
- **THEN** 应用调用注册接口，成功后进入工作台

#### Scenario: Empty credentials are rejected

- **WHEN** 用户在账号或密码为空时提交登录或注册
- **THEN** 不发起请求，页面提示需要填写账号和密码

### Requirement: Session is stored locally and treated as expired when missing or stale

登录或注册成功后，应用 MUST 把会话（至少包含 token 与过期时间）写入 `localStorage`。之后访问工作台时，应用 MUST 读取该会话。token 不存在或已过期时，应用 MUST 视为未登录。

#### Scenario: Successful auth persists a session

- **WHEN** 登录或注册成功
- **THEN** `localStorage` 中存在可用的 token 与过期时间

#### Scenario: Missing token is unauthenticated

- **WHEN** `localStorage` 中没有 token
- **THEN** 应用将用户视为未登录

#### Scenario: Expired token is unauthenticated

- **WHEN** `localStorage` 中的 token 已过期
- **THEN** 应用将用户视为未登录，并清除该失效会话

### Requirement: Unauthenticated visitors are sent to login

未登录或会话过期时，访问除登录页以外的路径 MUST 自动跳转到登录页。跳转 MUST 记住原先要去的地址，登录成功后回到该地址；若没有原地址，MUST 进入知识问答页。已登录用户打开登录页时 MUST 回到工作台，不停留在登录表单。

#### Scenario: Visiting a workspace page without a session

- **WHEN** 未登录用户访问知识问答、录入、入库记录或用量页
- **THEN** 浏览器进入登录页

#### Scenario: Login returns to the intended page

- **WHEN** 未登录用户因访问用量页被送到登录页并成功登录
- **THEN** 登录后进入用量页，而不是一律落到问答页

#### Scenario: Login without a return path goes to chat

- **WHEN** 用户直接打开登录页并成功登录
- **THEN** 进入知识问答页

#### Scenario: Authenticated user opens login

- **WHEN** 已登录用户打开登录页
- **THEN** 进入工作台，不停留在登录表单

### Requirement: Auth APIs are placeholders until the backend exists

登录与注册 MUST 通过独立的鉴权模块发起，页面 MUST NOT 直接拼请求。本阶段接口 MUST 是可替换的占位实现：不依赖真实后端也能完成登录、注册和进入工作台。占位实现 MUST 接受任意非空账号和密码并返回带过期时间的会话。

#### Scenario: Sign-in works without a real backend

- **WHEN** 后端登录接口尚不可用且用户提交非空账号密码
- **THEN** 占位登录成功并写入会话，用户进入工作台

#### Scenario: Sign-up works without a real backend

- **WHEN** 后端注册接口尚不可用且用户提交非空账号密码
- **THEN** 占位注册成功并写入会话，用户进入工作台

### Requirement: User can sign out from the workspace

已登录用户 MUST 能从工作台结束会话。退出后 MUST 清除本地会话并回到登录页。

#### Scenario: Sign out clears the session

- **WHEN** 已登录用户选择退出
- **THEN** 本地会话被清除，浏览器进入登录页

#### Scenario: After sign-out workspace is blocked

- **WHEN** 用户刚退出后又访问知识问答页
- **THEN** 再次被送到登录页
